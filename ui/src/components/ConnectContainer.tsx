import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Notifications } from './Notifications';
import { NetworkInfoForm } from './NetworkInfoForm';
import type { Network, NetworkInfo } from '../types';
import Image from 'next/image';
import { BrandText, Container, Header, Logo } from '../styles/components';

// Get the portal brand from environment variable
const portalBrand = process.env.PORTAL_BRAND;

// Mock data used as fallback when the API is not available
// const mockNetworks: Network[] = [
//   { ssid: 'Home WiFi', security: 'WPA', signalLevel: 90 },
//   { ssid: 'Office Network', security: 'WPA2', signalLevel: 75 },
//   { ssid: 'Guest Network', security: 'Open', signalLevel: 60 },
//   { ssid: 'Enterprise Network', security: 'enterprise', signalLevel: 85 }
// ];

export const ConnectContainer: React.FC = () => {
  const [attemptedConnect, setAttemptedConnect] = useState(false);
  const [isFetchingNetworks, setIsFetchingNetworks] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [availableNetworks, setAvailableNetworks] = useState<Network[]>([]);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cachedNetworksRef = useRef<Network[]>([]);

  // Define sendHeartbeat function
  const sendHeartbeat = async () => {
    try {
      await fetch('/heartbeat', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(3000)  // Short timeout for heartbeat
      });
      // No need to process response, just sending activity signal
    } catch (err) {
      // Silent fail on heartbeat errors, just log to console
      console.warn('Failed to send heartbeat:', err);
    }
  };
  
  // Use useCallback to memoize the startHeartbeat function
  const startHeartbeat = useCallback(() => {
    // Send heartbeat every 60 seconds to indicate frontend is active
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 60000); // 60 seconds
  }, []);
  
  // Now use useEffect with the dependency
  useEffect(() => {
    fetchNetworks();
    
    // Start the heartbeat interval when component mounts
    startHeartbeat();
    
    // Clean up the interval when component unmounts
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [startHeartbeat]); // Include startHeartbeat in the dependencies
  
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
      
      // If we received an empty array but have cached networks, use those instead
      if (data.length === 0 && cachedNetworksRef.current.length > 0) {
        console.log('No networks returned, using cached networks');
        setAvailableNetworks(cachedNetworksRef.current);
      } else {
        // Update both the state and the cache
        setAvailableNetworks(data);
        cachedNetworksRef.current = data;
      }
    } catch (err) {
      console.warn('Error fetching networks from API:', err);
      
      // If we have cached networks, use those as a fallback
      if (cachedNetworksRef.current.length > 0) {
        console.log('Fetch failed, using cached networks');
        setAvailableNetworks(cachedNetworksRef.current);
      }
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsFetchingNetworks(false);
    }
  };

  const refreshNetworks = async () => {
    setIsRefreshing(true);
    setError('');
    
    // Send a heartbeat first to ensure backend knows we're active
    await sendHeartbeat();
    
    try {
      // Call the refresh API endpoint
      const response = await fetch('/refresh', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Failed to refresh networks: ${response.statusText}`;
        } catch (jsonErr) {
          errorMessage = `Failed to refresh networks: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Only update networks if we actually got some back
      if (data.length > 0) {
        setAvailableNetworks(data);
        cachedNetworksRef.current = data;
      } else if (cachedNetworksRef.current.length > 0) {
        // If we got an empty array but have cached networks, stick with the cached ones
        console.log('No networks returned from refresh, keeping cached networks');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error refreshing networks:', errorMessage);
      setError(errorMessage);
      
      // Only re-fetch networks if the error isn't about being connected
      if (!errorMessage.includes("Cannot refresh while connected")) {
        // Re-fetch networks as a fallback
        fetchNetworks();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const onConnect = async (data: NetworkInfo) => {
    setAttemptedConnect(true);
    setError('');
    
    // Send a heartbeat first to ensure backend knows we're active
    await sendHeartbeat();

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
        {portalBrand ? (
          <BrandText>{portalBrand}</BrandText>
        ) : (
          <Logo>
            <Image src="/static/img/logo.svg" alt="Balena" width={100} height={30} priority />
          </Logo>
        )}
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
          onRefresh={refreshNetworks}
          isRefreshing={isRefreshing}
        />
      </Container>
    </>
  );
}; 