use std::error::Error as StdError;
use std::fmt;
use std::net::Ipv4Addr;
use std::sync::mpsc::{channel, Receiver, Sender};
use std::time::Duration;

use iron::modifiers::Redirect;
use iron::prelude::*;
use iron::{
    headers, status, typemap, AfterMiddleware, Iron, IronError, IronResult, Request, Response, Url,
};
use iron_cors::CorsMiddleware;
use mount::Mount;
use params::{FromValue, Params};
use std::path::PathBuf;
use persistent::Write;
use router::Router;
use serde_json;
use staticfile::Static;

use crate::errors::*;
use crate::exit::{exit, ExitResult};
use crate::network::{NetworkCommand, NetworkCommandResponse};

struct RequestSharedState {
    gateway: Ipv4Addr,
    server_rx: Receiver<NetworkCommandResponse>,
    network_tx: Sender<NetworkCommand>,
    exit_tx: Sender<ExitResult>,
}

impl typemap::Key for RequestSharedState {
    type Value = RequestSharedState;
}

#[derive(Debug)]
struct StringError(String);

impl fmt::Display for StringError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl StdError for StringError {
    // Modern implementation of StdError doesn't require description()
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        None
    }
}

macro_rules! get_request_ref {
    ($req:ident, $ty:ty, $err:expr) => {
        match $req.get_ref::<$ty>() {
            Ok(val) => val,
            Err(err) => {
                error!($err);
                return Err(IronError::new(err, status::InternalServerError));
            }
        }
    };
}

macro_rules! get_param {
    ($params:ident, $param:expr, $ty:ty) => {
        match $params.get($param) {
            Some(value) => match <$ty as FromValue>::from_value(value) {
                Some(converted) => converted,
                None => {
                    let err = format!("Unexpected type for '{}'", $param);
                    error!("{}", err);
                    return Err(IronError::new(
                        StringError(err),
                        status::InternalServerError,
                    ));
                }
            },
            None => {
                let err = format!("'{}' not found in request params: {:?}", $param, $params);
                error!("{}", err);
                return Err(IronError::new(
                    StringError(err),
                    status::InternalServerError,
                ));
            }
        }
    };
}

macro_rules! get_request_state {
    ($req:ident) => {
        get_request_ref!(
            $req,
            Write<RequestSharedState>,
            "Getting reference to request shared state failed"
        )
        .as_ref()
        .lock()
        .unwrap()
    };
}

fn exit_with_error<E>(state: &RequestSharedState, _e: E, e_kind: ErrorKind) -> IronResult<Response>
where
    E: ::std::error::Error + Send + 'static,
{
    // Create a simple error chain for Rust 2021
    let error_message = e_kind.to_string();
    let err = Error::from_kind(e_kind);
    exit(&state.exit_tx, err);
    Err(IronError::new(
        StringError(error_message),
        status::InternalServerError,
    ))
}

struct RedirectMiddleware;

impl AfterMiddleware for RedirectMiddleware {
    fn catch(&self, req: &mut Request, err: IronError) -> IronResult<Response> {
        let gateway = {
            let request_state = get_request_state!(req);
            format!("{}", request_state.gateway)
        };

        if let Some(host) = req.headers.get::<headers::Host>() {
            if host.hostname != gateway {
                let url = Url::parse(&format!("http://{}/", gateway)).unwrap();
                return Ok(Response::with((status::Found, Redirect(url))));
            }
        }

        Err(err)
    }
}

pub fn start_server(
    gateway: Ipv4Addr,
    listening_port: u16,
    server_rx: Receiver<NetworkCommandResponse>,
    network_tx: Sender<NetworkCommand>,
    exit_tx: Sender<ExitResult>,
    ui_directory: &PathBuf,
) {
    let exit_tx_clone = exit_tx.clone();
    let gateway_clone = gateway;
    let request_state = RequestSharedState {
        gateway,
        server_rx,
        network_tx,
        exit_tx,
    };

    // Log UI directory for debugging
    info!("Using UI directory: {:?}", ui_directory);

    let mut router = Router::new();
    // Serve the main UI from the root path
    router.get("/", Static::new(ui_directory), "index");
    // API endpoints
    router.get("/networks", networks, "networks");
    router.post("/connect", connect, "connect");
    router.post("/refresh", refresh, "refresh");
    router.post("/heartbeat", heartbeat, "heartbeat");

    // Next.js static export structure is different - we need to mount all static assets correctly
    let mut assets = Mount::new();
    assets.mount("/", router);
    
    // Mount static assets with proper configuration
    // Check for Next.js static directories and mount them
    if ui_directory.join("_next").exists() {
        info!("Mounting Next.js static files from _next directory");
        assets.mount("/_next", Static::new(ui_directory.join("_next")));
    } else {
        warn!("Next.js _next directory not found at {:?}", ui_directory.join("_next"));
    }
    
    // Mount static assets directory if it exists
    if ui_directory.join("static").exists() {
        info!("Mounting static directory from {:?}", ui_directory.join("static"));
        assets.mount("/static", Static::new(ui_directory.join("static")));
    } else {
        // For compatibility, still mount the UI directory at /static
        info!("Static directory not found, mounting UI directory at /static for compatibility");
        assets.mount("/static", Static::new(ui_directory));
    }
    
    // Also mount other common asset directories if they exist
    if ui_directory.join("images").exists() {
        info!("Mounting images directory");
        assets.mount("/images", Static::new(ui_directory.join("images")));
    }
    
    if ui_directory.join("assets").exists() {
        info!("Mounting assets directory");
        assets.mount("/assets", Static::new(ui_directory.join("assets")));
    }
    
    if ui_directory.join("public").exists() {
        info!("Mounting public directory");
        assets.mount("/public", Static::new(ui_directory.join("public")));
    }
    
    let cors_middleware = CorsMiddleware::with_allow_any();

    let mut chain = Chain::new(assets);
    chain.link(Write::<RequestSharedState>::both(request_state));
    chain.link_after(RedirectMiddleware);
    chain.link_around(cors_middleware);

    // Bind to all interfaces (0.0.0.0) instead of just the gateway IP
    let address = format!("0.0.0.0:{}", listening_port);

    info!("Starting HTTP server on {} (accessible via {}:{})", address, gateway_clone, listening_port);

    if let Err(e) = Iron::new(chain).http(&address) {
        exit(
            &exit_tx_clone,
            ErrorKind::StartHTTPServer(address, e.to_string()).into(),
        );
    }
}

fn networks(req: &mut Request) -> IronResult<Response> {
    info!("User connected to the captive portal");

    let request_state = get_request_state!(req);

    // Check if the NetworkCommandHandler is refreshing
    let is_refreshing = check_refreshing_state(&request_state.network_tx);
    if is_refreshing {
        debug!("Network scan in progress, returning temporarily unavailable");
        return Ok(Response::with((status::ServiceUnavailable, "{\"error\": \"Network scan in progress, please try again shortly\"}")));
    }

    if let Err(e) = request_state.network_tx.send(NetworkCommand::Activate) {
        return exit_with_error(&request_state, e, ErrorKind::SendNetworkCommandActivate);
    }

    let networks = match request_state.server_rx.recv() {
        Ok(result) => match result {
            NetworkCommandResponse::Networks(networks) => networks,
        },
        Err(e) => return exit_with_error(&request_state, e, ErrorKind::RecvAccessPointSSIDs),
    };

    let access_points_json = match serde_json::to_string(&networks) {
        Ok(json) => json,
        Err(e) => return exit_with_error(&request_state, e, ErrorKind::SerializeAccessPointSSIDs),
    };

    Ok(Response::with((status::Ok, access_points_json)))
}

fn connect(req: &mut Request) -> IronResult<Response> {
    let (ssid, identity, passphrase) = {
        let params = get_request_ref!(req, Params, "Getting request params failed");
        let ssid = get_param!(params, "ssid", String);
        let identity = get_param!(params, "identity", String);
        let passphrase = get_param!(params, "passphrase", String);
        (ssid, identity, passphrase)
    };

    debug!("Incoming `connect` to access point `{}` request", ssid);

    let request_state = get_request_state!(req);

    let command = NetworkCommand::Connect {
        ssid,
        identity,
        passphrase,
    };

    if let Err(e) = request_state.network_tx.send(command) {
        exit_with_error(&request_state, e, ErrorKind::SendNetworkCommandConnect)
    } else {
        Ok(Response::with(status::Ok))
    }
}

fn refresh(req: &mut Request) -> IronResult<Response> {
    info!("Refresh networks request received");

    let request_state = get_request_state!(req);

    // Check if already refreshing
    let is_refreshing = check_refreshing_state(&request_state.network_tx);
    if is_refreshing {
        debug!("Network scan already in progress");
        return Ok(Response::with((status::ServiceUnavailable, "{\"error\": \"Network scan already in progress\"}")));
    }
    
    // Check if we have an established connection
    let (tx, rx) = channel();
    if let Err(e) = request_state.network_tx.send(NetworkCommand::CheckConnectionStatus(tx.clone())) {
        debug!("Failed to check connection status: {}", e);
    } else {
        // Wait for response with timeout
        match rx.recv_timeout(Duration::from_millis(500)) {
            Ok(true) => {
                // We have an active connection - don't allow refresh
                info!("Refresh rejected: active connection exists");
                return Ok(Response::with((status::BadRequest, "{\"error\": \"Cannot refresh while connected to a network\"}")));
            },
            _ => {} // Continue if no connection or error occurred
        }
    }

    if let Err(e) = request_state.network_tx.send(NetworkCommand::Refresh) {
        info!("Incoming `refresh` request - sending refresh command {}", e);
        return exit_with_error(&request_state, e, ErrorKind::SendNetworkCommandActivate);
    }

    let networks = match request_state.server_rx.recv() {
        Ok(result) => match result {
            NetworkCommandResponse::Networks(networks) => networks,
        },
        Err(e) => {
            error!("Error RecvAccessPointSSIDs: {}", e);
            return exit_with_error(&request_state, e, ErrorKind::RecvAccessPointSSIDs);
        }
    };

    let access_points_json = match serde_json::to_string(&networks) {
        Ok(json) => json,
        Err(e) => {
            error!("Error SerializeAccessPointSSIDs: {}", e);
            return exit_with_error(&request_state, e, ErrorKind::SerializeAccessPointSSIDs);
        }
    };

    Ok(Response::with((status::Ok, access_points_json)))
}

fn heartbeat(req: &mut Request) -> IronResult<Response> {
    debug!("Heartbeat received from frontend");
    
    let request_state = get_request_state!(req);
    
    if let Err(e) = request_state.network_tx.send(NetworkCommand::RetryLastConnection) {
        debug!("Failed to send heartbeat: {}", e);
        // Don't exit on heartbeat failures, just return an error
        return Ok(Response::with((status::InternalServerError, "Failed to process heartbeat")));
    }
    
    Ok(Response::with(status::Ok))
}

// Helper function to check if a refresh is in progress
fn check_refreshing_state(network_tx: &Sender<NetworkCommand>) -> bool {
    // This is a temporary channel to get the state
    let (tx, rx) = channel();
    
    // Create a special command to check state
    if let Err(_) = network_tx.send(NetworkCommand::CheckRefreshingState(tx.clone())) {
        // If we can't send the command, assume not refreshing for safety
        return false;
    }
    
    // Wait for a response with a short timeout
    match rx.recv_timeout(Duration::from_millis(500)) {
        Ok(is_refreshing) => is_refreshing,
        Err(_) => false // If timeout, assume not refreshing
    }
}
