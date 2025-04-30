export interface NetworkInfo {
  ssid?: string;
  identity?: string;
  passphrase?: string;
}

export interface Network {
  ssid: string;
  security: string;
  signal_strength: number;
} 