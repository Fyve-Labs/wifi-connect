use network_manager;

use crate::network;

// Use the error_chain macro with the proper config
// The error_chain crate will use to_string() instead of description() in newer Rust
error_chain! {
    foreign_links {
        Io(::std::io::Error);
        Recv(::std::sync::mpsc::RecvError);
        SendNetworkCommand(::std::sync::mpsc::SendError<crate::network::NetworkCommand>);
        Nix(::nix::Error);
    }

    links {
        NetworkManager(network_manager::errors::Error, network_manager::errors::ErrorKind);
    }

    errors {
        RecvAccessPointSSIDs {
            description("Receiving access point SSIDs failed")
            display("Failed to receive access point SSIDs")
        }

        SendAccessPointSSIDs {
            description("Sending access point SSIDs failed")
            display("Failed to send access point SSIDs")
        }

        SerializeAccessPointSSIDs {
            description("Serializing access point SSIDs failed")
            display("Failed to serialize access point SSIDs")
        }

        RecvNetworkCommand {
            description("Receiving network command failed")
            display("Failed to receive network command")
        }

        SendNetworkCommandActivate {
            description("Sending NetworkCommand::Activate failed")
            display("Failed to send network activation command")
        }

        SendNetworkCommandConnect {
            description("Sending NetworkCommand::Connect failed")
            display("Failed to send network connect command")
        }

        DeviceByInterface(interface: String) {
            description("Cannot find network device with interface name")
            display("Cannot find network device with interface name '{}'", interface)
        }

        NotAWiFiDevice(interface: String) {
            description("Not a WiFi device")
            display("Not a WiFi device: {}", interface)
        }

        UnmanagedDevice(interface: String) {
            description("Unmanaged device")
            display("Unmanaged device: {}", interface)
        }

        NoWiFiDevice {
            description("Cannot find a WiFi device")
            display("Cannot find a WiFi device")
        }

        NoAccessPoints {
            description("Getting access points failed")
            display("Failed to get access points")
        }

        CreateCaptivePortal {
            description("Creating the captive portal failed")
            display("Failed to create the captive portal")
        }

        StopAccessPoint {
            description("Stopping the access point failed")
            display("Failed to stop the access point")
        }

        DeleteAccessPoint {
            description("Deleting access point connection profile failed")
            display("Failed to delete access point connection profile")
        }

        StartHTTPServer(address: String, reason: String) {
            description("Cannot start HTTP server")
            display("Cannot start HTTP server on '{}': {}", address, reason)
        }

        StartActiveNetworkManager {
            description("Starting the NetworkManager service with active state failed")
            display("Failed to start the NetworkManager service with active state")
        }

        StartNetworkManager {
            description("Starting the NetworkManager service failed")
            display("Failed to start the NetworkManager service")
        }

        Dnsmasq {
            description("Spawning dnsmasq failed")
            display("Failed to spawn dnsmasq")
        }

        BlockExitSignals {
            description("Blocking exit signals failed")
            display("Failed to block exit signals")
        }

        TrapExitSignals {
            description("Trapping exit signals failed")
            display("Failed to trap exit signals")
        }

        RootPrivilegesRequired(app: String) {
            description("Root privileges required")
            display("You need root privileges to run {}", app)
        }
    }
}

pub fn exit_code(e: &Error) -> i32 {
    match *e.kind() {
        ErrorKind::Dnsmasq => 3,
        ErrorKind::RecvAccessPointSSIDs => 4,
        ErrorKind::SendAccessPointSSIDs => 5,
        ErrorKind::SerializeAccessPointSSIDs => 6,
        ErrorKind::RecvNetworkCommand => 7,
        ErrorKind::SendNetworkCommandActivate => 8,
        ErrorKind::SendNetworkCommandConnect => 9,
        ErrorKind::DeviceByInterface(_) => 10,
        ErrorKind::NotAWiFiDevice(_) => 11,
        ErrorKind::NoWiFiDevice => 12,
        ErrorKind::NoAccessPoints => 13,
        ErrorKind::CreateCaptivePortal => 14,
        ErrorKind::StopAccessPoint => 15,
        ErrorKind::DeleteAccessPoint => 16,
        ErrorKind::StartHTTPServer(_, _) => 17,
        ErrorKind::StartActiveNetworkManager => 18,
        ErrorKind::StartNetworkManager => 19,
        ErrorKind::BlockExitSignals => 21,
        ErrorKind::TrapExitSignals => 22,
        ErrorKind::RootPrivilegesRequired(_) => 23,
        ErrorKind::UnmanagedDevice(_) => 24,
        _ => 1,
    }
}
