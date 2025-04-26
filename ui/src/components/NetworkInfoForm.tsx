'use client';

import React, { useState, useEffect, useMemo, useCallback, FormEvent, ChangeEvent } from 'react';
import styled from 'styled-components';
import Button from './Button';
import type { Network, NetworkInfo } from '../types';

interface NetworkInfoFormProps {
  availableNetworks: Network[];
  onSubmit: (data: NetworkInfo) => void;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const NetworkInfoForm: React.FC<NetworkInfoFormProps> = ({
  availableNetworks,
  onSubmit,
}: NetworkInfoFormProps) => {
  const [data, setData] = useState<NetworkInfo>({
    ssid: availableNetworks.length > 0 ? availableNetworks[0].ssid : '',
    identity: '',
    passphrase: '',
  });

  // Update SSID when networks become available
  useEffect(() => {
    if (availableNetworks.length > 0 && !data.ssid) {
      setData((prevData: NetworkInfo) => ({ ...prevData, ssid: availableNetworks[0].ssid }));
    }
  }, [availableNetworks, data.ssid]);

  // Determine if selected network is enterprise
  const isSelectedNetworkEnterprise = useMemo(() => {
    return availableNetworks.some(
      (network: Network) =>
        network.ssid === data.ssid && network.security === 'enterprise',
    );
  }, [availableNetworks, data.ssid]);

  // Form submit handler
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  }, [data, onSubmit]);

  // Input change handler
  const handleChange = useCallback((field: keyof NetworkInfo) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setData({ ...data, [field]: e.target.value });
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="ssid">WiFi Network</Label>
        <Select
          id="ssid"
          value={data.ssid || ''}
          onChange={handleChange('ssid')}
          required
        >
          {availableNetworks.map((network) => (
            <option key={network.ssid} value={network.ssid}>
              {network.ssid} ({network.security}) - Signal: {network.signalLevel}
            </option>
          ))}
        </Select>
      </FormGroup>

      {isSelectedNetworkEnterprise && (
        <FormGroup>
          <Label htmlFor="identity">Identity (optional)</Label>
          <Input
            id="identity"
            type="text"
            value={data.identity || ''}
            onChange={handleChange('identity')}
          />
        </FormGroup>
      )}

      <FormGroup>
        <Label htmlFor="passphrase">Password</Label>
        <Input
          id="passphrase"
          type="password"
          value={data.passphrase || ''}
          onChange={handleChange('passphrase')}
        />
      </FormGroup>

      <Button type="submit" variant="primary" fullWidth>
        Connect
      </Button>
    </Form>
  );
}; 