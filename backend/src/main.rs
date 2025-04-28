#![recursion_limit = "1024"]

#[macro_use]
extern crate log;

#[macro_use]
extern crate error_chain;

#[macro_use]
extern crate serde_derive;

#[macro_use]
extern crate clap;

extern crate env_logger;
extern crate iron;
extern crate iron_cors;
extern crate mount;
extern crate network_manager;
extern crate nix;
extern crate params;
extern crate persistent;
extern crate router;
extern crate serde_json;
extern crate staticfile;

mod config;
mod dnsmasq;
mod errors;
mod exit;
mod logger;
mod network;
mod privileges;
mod server;

use std::io::Write;
use std::process;
use std::sync::mpsc::channel;
use std::thread;
use std::time::Duration;

use config::get_config;
use errors::*;
use exit::block_exit_signals;
use network::{init_networking, process_network_commands};
use privileges::require_root;

fn main() {
    if let Err(ref e) = run() {
        let stderr = &mut ::std::io::stderr();
        let errmsg = "Error writing to stderr";

        writeln!(stderr, "\x1B[1;31mError: {}\x1B[0m", e).expect(errmsg);

        for inner in e.iter().skip(1) {
            writeln!(stderr, "  caused by: {}", inner).expect(errmsg);
        }

        if let Some(backtrace) = e.backtrace() {
            writeln!(stderr, "Backtrace: {:?}", backtrace).expect(errmsg);
        }

        process::exit(exit_code(e));
    }
}

fn run() -> Result<()> {
    block_exit_signals()?;

    logger::init();

    let config = get_config();

    require_root()?;

    init_networking(&config)?;

    // Add a startup delay to allow network hardware initialization
    info!("Pausing for network initialization...");
    thread::sleep(Duration::from_secs(3));
    info!("Starting WiFi Connect service");

    let (exit_tx, exit_rx) = channel();

    thread::spawn(move || {
        process_network_commands(&config, &exit_tx);
    });

    match exit_rx.recv() {
        Ok(result) => result?,
        Err(e) => {
            return Err(e.into());
        }
    }

    Ok(())
}

fn exit_code(e: &Error) -> i32 {
    match e.kind() {
        // If we know the specific error, return it to other programs
        // See wifi::errors::ErrorKind
        ErrorKind::RecvAccessPointSSIDs
        | ErrorKind::SendAccessPointSSIDs
        | ErrorKind::SerializeAccessPointSSIDs
        | ErrorKind::RecvNetworkCommand
        | ErrorKind::SendNetworkCommandActivate
        | ErrorKind::SendNetworkCommandConnect
        | ErrorKind::NoWiFiDevice
        | ErrorKind::NoAccessPoints
        | ErrorKind::NotAWiFiDevice(_)
        | ErrorKind::CreateCaptivePortal
        | ErrorKind::StopAccessPoint
        | ErrorKind::StartNetworkManager
        | ErrorKind::StartActiveNetworkManager
        | ErrorKind::DeleteAccessPoint => exit_code_from_kind(e),
        _ => {
            // Otherwise, for simplicity, we don't try to translate the error code
            1
        }
    }
}

fn exit_code_from_kind(e: &Error) -> i32 {
    match e.kind() {
        ErrorKind::RecvAccessPointSSIDs => 4,
        ErrorKind::SendAccessPointSSIDs => 5,
        ErrorKind::SerializeAccessPointSSIDs => 6,
        ErrorKind::RecvNetworkCommand => 7,
        ErrorKind::SendNetworkCommandActivate => 8,
        ErrorKind::SendNetworkCommandConnect => 9,
        ErrorKind::NoWiFiDevice => 12,
        ErrorKind::NotAWiFiDevice(_) => 11,
        ErrorKind::NoAccessPoints => 13,
        ErrorKind::CreateCaptivePortal => 14,
        ErrorKind::StopAccessPoint => 15,
        ErrorKind::DeleteAccessPoint => 16,
        ErrorKind::StartNetworkManager => 19,
        ErrorKind::StartActiveNetworkManager => 18,
        _a => 1,
    }
}
