use std::process::{Child, Command};

use network_manager::Device;

use crate::config::Config;
use crate::errors::*;

pub fn start_dnsmasq(config: &Config, device: &Device) -> Result<Child> {
    let interface = device.interface();

    let args = vec![
        format!("--address=/#/{}", config.gateway),
        "--dhcp-authoritative".to_string(),
        "--keep-in-foreground".to_string(),
        "--bind-interfaces".to_string(),
        "--except-interface=lo".to_string(),
        format!("--interface={}", interface),
        format!("--dhcp-range={}", config.dhcp_range),
        format!("--dhcp-option=option:router,{}", config.gateway),
    ];
    Command::new("dnsmasq")
        .args(args)
        .spawn()
        .map_err(|e| Error::with_chain(e, ErrorKind::Dnsmasq))
}

pub fn stop_dnsmasq(dnsmasq: &mut Child) -> Result<()> {
    dnsmasq.kill().map_err(|e| {
        warn!("Failed to kill dnsmasq: {}", e);
        Error::with_chain(e, ErrorKind::Dnsmasq)
    })
}
