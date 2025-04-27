'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import type { Network, NetworkInfo } from '../types';

interface NetworkInfoFormProps {
  availableNetworks: Network[];
  onSubmit: (data: NetworkInfo) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const FormContainer = styled.div`
  margin-top: 2rem;
`;

const Heading = styled.h2`
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #444;
`;

const Form = styled.form`
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 1rem;
`;

const ConnectButton = styled.button`
  background-color: #a5d8f3;
  color: #333;
  font-weight: 600;
  border: none;
  padding: 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #8ecbec;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RefreshButton = styled.button`
  background-color: #f0f0f0;
  color: #333;
  font-weight: 600;
  border: none;
  padding: 0.75rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 1rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

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
  
  // Update SSID when networks become available
  useEffect(() => {
    if (availableNetworks.length > 0 && !data.ssid) {
      setData((prevData) => ({ ...prevData, ssid: availableNetworks[0].ssid }));
    }
  }, [availableNetworks, data.ssid]);

  // Determine if selected network is enterprise
  const isSelectedNetworkEnterprise = useMemo(() => {
    return availableNetworks.some(
      (network) =>
        network.ssid === data.ssid && network.security === 'enterprise',
    );
  }, [availableNetworks, data.ssid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const handleChange = (field: keyof NetworkInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setData({ ...data, [field]: e.target.value });
  };

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <FormContainer>
      <Heading>
        Hi! Please choose your WiFi from the list
      </Heading>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="ssid">SSID*</Label>
          <Select
            id="ssid"
            value={data.ssid || ''}
            onChange={handleChange('ssid')}
            required
            disabled={availableNetworks.length <= 0}
          >
            {availableNetworks.map((network) => (
              <option key={network.ssid} value={network.ssid}>
                {network.ssid}
              </option>
            ))}
          </Select>
        </FormGroup>

        {isSelectedNetworkEnterprise && (
          <FormGroup>
            <Label htmlFor="identity">Identity</Label>
            <Input
              id="identity"
              type="text"
              value={data.identity || ''}
              onChange={handleChange('identity')}
            />
          </FormGroup>
        )}

        <FormGroup>
          <Label htmlFor="passphrase">Passphrase</Label>
          <InputContainer>
            <Input
              id="passphrase"
              type={showPassword ? "text" : "password"}
              value={data.passphrase || ''}
              onChange={handleChange('passphrase')}
            />
            <TogglePasswordButton 
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </TogglePasswordButton>
          </InputContainer>
        </FormGroup>

        <ButtonsContainer>
          <ConnectButton
            type="submit"
            disabled={availableNetworks.length <= 0}
          >
            Connect
          </ConnectButton>
          
          <RefreshButton
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Networks"}
          </RefreshButton>
        </ButtonsContainer>
      </Form>
    </FormContainer>
  );
}; 