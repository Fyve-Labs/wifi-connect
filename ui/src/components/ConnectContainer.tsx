import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Notifications } from './Notifications';
import { NetworkInfoForm } from './NetworkInfoForm';
import type { Network, NetworkInfo } from '../types';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  background-color: #333;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;

  img {
    height: 30px;
    margin-right: 8px;
  }
`;

export const ConnectContainer: React.FC = () => {
  const [attemptedConnect, setAttemptedConnect] = useState(false);
  const [isFetchingNetworks, setIsFetchingNetworks] = useState(true);
  const [error, setError] = useState('');
  const [availableNetworks, setAvailableNetworks] = useState<Network[]>([]);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        // Simulate network fetch (replace with actual API call)
        setTimeout(() => {
          // For demonstration - in production, use the actual API
          const mockNetworks: Network[] = [
            { ssid: 'Home WiFi', security: 'WPA', signalLevel: 90 },
            { ssid: 'Office Network', security: 'WPA2', signalLevel: 75 },
            { ssid: 'Guest Network', security: 'Open', signalLevel: 60 },
            { ssid: 'Enterprise Network', security: 'enterprise', signalLevel: 85 }
          ];
          setAvailableNetworks(mockNetworks);
          setIsFetchingNetworks(false);
        }, 1000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to fetch available networks. ${errorMessage}`);
        setIsFetchingNetworks(false);
      }
    };

    fetchNetworks();
  }, []);

  const onConnect = async (data: NetworkInfo) => {
    setAttemptedConnect(true);
    setError('');

    try {
      // Simulate API call (replace with actual API call)
      console.log('Connecting to network:', data);
      // In production, make an actual API call:
      // const response = await fetch('/connect', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      // if (!response.ok) {
      //   throw new Error(response.statusText);
      // }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to connect to the network. ${errorMessage}`);
    }
  };

  return (
    <>
      <Header>
        <Logo>
          <img src="/logo.svg" alt="Balena" />
        </Logo>
      </Header>

      <Container>
        <Notifications
          attemptedConnect={attemptedConnect}
          hasAvailableNetworks={
            isFetchingNetworks || availableNetworks.length > 0
          }
          error={error}
        />
        <NetworkInfoForm
          availableNetworks={availableNetworks}
          onSubmit={onConnect}
        />
      </Container>
    </>
  );
}; 