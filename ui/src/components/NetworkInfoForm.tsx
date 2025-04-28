'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Network, NetworkInfo } from '../types';
import {
  FormContainer,
  Heading,
  Form,
  FormGroup,
  Label,
  Select,
  InputContainer,
  Input,
  TogglePasswordButton,
  PrimaryButton,
  SecondaryButton,
  ButtonsContainer,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogText,
  DialogButtonsContainer,
  DialogButton,
  SpinnerOverlay,
  SpinnerContainer,
  Spinner,
  SpinnerText
} from '../styles/components';
import styled from 'styled-components';

// Custom light blue button with a lighter shade
const LightBlueButton = styled(PrimaryButton)`
  background-color: #a5d8f3;
  
  &:hover:not(:disabled) {
    background-color: #8ecbec;
  }
`;

interface NetworkInfoFormProps {
  availableNetworks: Network[];
  onSubmit: (data: NetworkInfo) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

// Enhanced styling for required form labels
const RequiredLabel = styled(Label)`
  &::after {
    content: "*";
    color: #e53935;
    margin-left: 4px;
  }
`;

// Helper function to determine signal strength icon
const getSignalStrengthIcon = (strength: number): string => {
  return `(${strength}%)`;
  // if (strength >= 80) return '▮▮▮▮'; 
  // if (strength >= 60) return '▮▮▮▯';
  // if (strength >= 40) return '▮▮▯▯';
  // if (strength >= 20) return '▮▯▯▯';
  // return '▯▯▯▯';
};

// Helper function to get security icon
const getSecurityIcon = (security: string): string => {
  switch (security) {
    case 'wpa':
    case 'wpa2':
      return "(WPA)"; // '🔒';
    case 'enterprise':
      return "(Enterprise)"; // '🔐';
    case 'wep':
      return "(WEP)"; // '🔓';
    case 'none':
      return "(Open)"; // '📶';
    default:
      return "(Unknown)"; // '❓';
  }
};

// Helper to get security label
const getSecurityLabel = (security: string): string => {
  switch (security) {
    case 'wpa':
    case 'wpa2':
      return 'WPA Password';
    case 'enterprise':
      return 'Enterprise Password';
    case 'wep':
      return 'WEP Key';
    case 'none':
      return 'No Password Required';
    default:
      return 'Password';
  }
};

export const NetworkInfoForm: React.FC<NetworkInfoFormProps> = ({
  availableNetworks,
  onSubmit,
  onRefresh,
  isRefreshing,
}: NetworkInfoFormProps) => {
  const [data, setData] = useState<NetworkInfo>({
    ssid: availableNetworks.length > 0 ? availableNetworks[0].ssid : '',
    identity: '',
    passphrase: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [formValid, setFormValid] = useState(false);
  const [finalizingRefresh, setFinalizingRefresh] = useState(false);
  const [finalizeMessage, setFinalizeMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Get the currently selected network
  const selectedNetwork = useMemo(() => {
    return availableNetworks.find(network => network.ssid === data.ssid);
  }, [availableNetworks, data.ssid]);

  // Determine if selected network is enterprise
  const isSelectedNetworkEnterprise = useMemo(() => {
    return selectedNetwork?.security === 'enterprise';
  }, [selectedNetwork]);
  
  // Determine if selected network requires a password
  const requiresPassword = useMemo(() => {
    return selectedNetwork?.security !== 'none';
  }, [selectedNetwork]);
  
  // Get the security type label
  const securityLabel = useMemo(() => {
    return selectedNetwork ? getSecurityLabel(selectedNetwork.security) : 'Password';
  }, [selectedNetwork]);
  
  // Update SSID when networks become available or change
  useEffect(() => {
    // If no networks are available, reset the form
    if (availableNetworks.length === 0) {
      setData({
        ssid: '',
        identity: '',
        passphrase: ''
      });
      return;
    }
    
    // If the current selection is no longer in the list after a refresh, reset to the first available network
    if (data.ssid && !availableNetworks.some(network => network.ssid === data.ssid)) {
      setData({
        ssid: availableNetworks[0].ssid,
        identity: '',
        passphrase: ''
      });
      return;
    }
    
    // If there's no selection yet but networks are available, select the first one
    if (!data.ssid && availableNetworks.length > 0) {
      setData(prevData => ({ 
        ...prevData, 
        ssid: availableNetworks[0].ssid 
      }));
    }
  }, [availableNetworks, data.ssid]);
  
  // Validate form when data changes
  useEffect(() => {
    let isValid = false;
    
    if (data.ssid) {
      if (requiresPassword) {
        // For secured networks, require password
        isValid = !!data.passphrase && data.passphrase.length > 0;
        
        // For enterprise networks, also require identity
        if (isSelectedNetworkEnterprise) {
          isValid = isValid && !!data.identity && data.identity.length > 0;
        }
      } else {
        // For open networks, no password needed
        isValid = true;
      }
    }
    
    setFormValid(isValid);
  }, [data, requiresPassword, isSelectedNetworkEnterprise]);
  
  // Setup polling when required
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    
    if (polling) {
      // Use a longer polling interval (20 seconds instead of 10)
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch('/networks', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            // Increase timeout to 10 seconds 
            signal: AbortSignal.timeout(10000)
          });
          
          if (response.ok) {
            // Networks are available again - but don't immediately make UI available
            // Start the finalization delay
            setFinalizeMessage('Networks found! Finalizing connection...');
            setFinalizingRefresh(true);
            
            // Set a timeout to complete the refresh after 15 seconds
            setTimeout(() => {
              setPolling(false);
              setPollAttempts(0);
              setFinalizingRefresh(false);
              
              // Now call onRefresh to update the UI with the new networks
              onRefresh();
            }, 15000);
          } else if (response.status === 503) {
            // Still scanning, increment attempts
            setPollAttempts(prev => prev + 1);
          } else {
            // Unexpected error
            console.error('Unexpected status while polling:', response.status);
            setPolling(false);
            setFinalizingRefresh(false);
          }
        } catch (err) {
          console.warn('Error during polling:', err);
          setPollAttempts(prev => prev + 1);
          
          // Give up after 30 attempts (10 minutes with 20-second interval)
          if (pollAttempts > 30) {
            setPolling(false);
            setPollAttempts(0);
            setFinalizingRefresh(false);
            // Try to refresh one last time
            onRefresh();
          }
        }
      }, 20000); // Poll every 20 seconds instead of 10
    }
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [polling, pollAttempts, onRefresh]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formValid && !isConnecting) {
      setIsConnecting(true);
      onSubmit(data);
    }
  };

  const handleChange = (field: keyof NetworkInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    // Reset the passphrase when changing networks
    if (field === 'ssid') {
      setData({ 
        ...data, 
        [field]: e.target.value,
        passphrase: '' 
      });
    } else {
      setData({ ...data, [field]: e.target.value });
    }
  };

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };
  
  const handleRefreshClick = () => {
    setShowWarningDialog(true);
  };
  
  const handleConfirmRefresh = async () => {
    setShowWarningDialog(false);
    setPolling(true);
    setPollAttempts(0);
    onRefresh();
  };
  
  const handleCancelRefresh = () => {
    setShowWarningDialog(false);
  };

  // Determine if inputs should be disabled
  const inputsDisabled = isRefreshing || polling || finalizingRefresh || isConnecting;

  return (
    <FormContainer>
      <Heading>
        Please choose your WiFi network from the list.
      </Heading>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <RequiredLabel htmlFor="ssid">WiFi Network</RequiredLabel>
          <Select
            id="ssid"
            value={data.ssid || ''}
            onChange={handleChange('ssid')}
            required
            disabled={availableNetworks.length <= 0 || inputsDisabled}
          >
            {availableNetworks.map((network) => (
              <option key={network.ssid} value={network.ssid}>
                {network.ssid} {getSignalStrengthIcon(network.signal_strength)} {getSecurityIcon(network.security)}
              </option>
            ))}
          </Select>
        </FormGroup>

        {isSelectedNetworkEnterprise && (
          <FormGroup>
            <RequiredLabel htmlFor="identity">Identity</RequiredLabel>
            <Input
              id="identity"
              type="text"
              value={data.identity || ''}
              onChange={handleChange('identity')}
              required
              disabled={inputsDisabled}
            />
          </FormGroup>
        )}

        {selectedNetwork && (
          <FormGroup>
            {requiresPassword ? (
              <RequiredLabel htmlFor="passphrase">{securityLabel}</RequiredLabel>
            ) : (
              <Label htmlFor="passphrase">{securityLabel}</Label>
            )}
            <InputContainer>
              <Input
                id="passphrase"
                type={showPassword ? "text" : "password"}
                value={data.passphrase || ''}
                onChange={handleChange('passphrase')}
                disabled={!requiresPassword || inputsDisabled}
                required={requiresPassword}
              />
              {requiresPassword && (
                <TogglePasswordButton 
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={inputsDisabled}
                >
                  {!showPassword ? "⛔" : "👁️" }
                </TogglePasswordButton>
              )}
            </InputContainer>
          </FormGroup>
        )}

        <ButtonsContainer>
          <LightBlueButton
            type="submit"
            disabled={!formValid || availableNetworks.length <= 0 || inputsDisabled}
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </LightBlueButton>
          
          <SecondaryButton
            type="button"
            onClick={handleRefreshClick}
            disabled={inputsDisabled}
          >
            {isRefreshing || polling || finalizingRefresh ? "Refreshing..." : "Refresh Networks"}
          </SecondaryButton>
        </ButtonsContainer>
      </Form>
      
      {/* Warning Dialog */}
      {showWarningDialog && (
        <DialogOverlay>
          <DialogContent>
            <DialogTitle>Warning: Network Scan</DialogTitle>
            <DialogText>
              The service will go offline to re-scan for available WiFi networks. 
              The access point will be unavailable for up to 2 minutes to complete.
              <br /><br />
              Do you want to proceed with the network scan?
            </DialogText>
            <DialogButtonsContainer>
              <DialogButton onClick={handleCancelRefresh}>Cancel</DialogButton>
              <DialogButton primary onClick={handleConfirmRefresh}>Proceed</DialogButton>
            </DialogButtonsContainer>
          </DialogContent>
        </DialogOverlay>
      )}
      
      {/* Polling Spinner */}
      {(polling || finalizingRefresh || isConnecting) && (
        <SpinnerOverlay>
          <SpinnerContainer>
            <Spinner />
            <SpinnerText>
              {isConnecting 
                ? "Connecting to network... If successful, this site will no longer be available." 
                : finalizingRefresh 
                  ? finalizeMessage 
                  : `Scanning for networks... (Attempt ${pollAttempts + 1})`}
            </SpinnerText>
          </SpinnerContainer>
        </SpinnerOverlay>
      )}
    </FormContainer>
  );
}; 