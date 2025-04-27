import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Notifications } from './Notifications';
import { NetworkInfoForm } from './NetworkInfoForm';
import type { Network, NetworkInfo } from '../types';
import Image from 'next/image';

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

// Mock data used as fallback when the API is not available
const mockNetworks: Network[] = [
  { ssid: 'Home WiFi', security: 'WPA', signalLevel: 90 },
  { ssid: 'Office Network', security: 'WPA2', signalLevel: 75 },
  { ssid: 'Guest Network', security: 'Open', signalLevel: 60 },
  { ssid: 'Enterprise Network', security: 'enterprise', signalLevel: 85 }
];

export const ConnectContainer: React.FC = () => {
  const [attemptedConnect, setAttemptedConnect] = useState(false);
  const [isFetchingNetworks, setIsFetchingNetworks] = useState(true);
  const [error, setError] = useState('');
  const [availableNetworks, setAvailableNetworks] = useState<Network[]>([]);

  useEffect(() => {
    const fetchNetworks = async () => {
      setIsFetchingNetworks(true);
      setError('');
      
      try {
        // Use relative path that will be handled by the backend
        const response = await fetch('/networks', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          // Adding a short timeout to fail faster if the endpoint is not available
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch networks: ${response.statusText}`);
        }
        
        const data = await response.json();
        setAvailableNetworks(data);
      } catch (err) {
        console.warn('Error fetching networks from API, using mock data:', err);
        
        // If the API call fails, use mock data after a small delay to simulate loading
        setTimeout(() => {
          setAvailableNetworks(mockNetworks);
        }, 800);
      } finally {
        setIsFetchingNetworks(false);
      }
    };

    fetchNetworks();
  }, []);

  const onConnect = async (data: NetworkInfo) => {
    setAttemptedConnect(true);
    setError('');

    try {
      // Use relative path that will be handled by the backend
      const response = await fetch('/connect', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Adding a short timeout to fail faster if the endpoint is not available
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Failed to connect to the network.');
      }
      
      // Success - connection initiated
      console.log('Connection initiated successfully');
    } catch (err) {
      // Handle error and display it in the UI
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to connect to the network. ${errorMessage}`);
    }
  };

  return (
    <>
      <Header>
        <Logo>
          <Image src="/logo.svg" alt="Balena" width={100} height={30} priority />
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