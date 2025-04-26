'use client';

import React from 'react';
import styled from 'styled-components';

interface NotificationsProps {
  attemptedConnect: boolean;
  hasAvailableNetworks: boolean;
  error: string;
}

const NotificationContainer = styled.div`
  margin-bottom: 1.5rem;
`;

type AlertVariant = 'success' | 'error' | 'info';

const Alert = styled.div<{ $variant: AlertVariant }>`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  color: ${({ $variant }: { $variant: AlertVariant }) => 
    $variant === 'success' ? '#155724' : 
    $variant === 'error' ? '#721c24' : '#0c5460'};
  background-color: ${({ $variant }: { $variant: AlertVariant }) => 
    $variant === 'success' ? '#d4edda' : 
    $variant === 'error' ? '#f8d7da' : '#d1ecf1'};
  border: 1px solid ${({ $variant }: { $variant: AlertVariant }) => 
    $variant === 'success' ? '#c3e6cb' : 
    $variant === 'error' ? '#f5c6cb' : '#bee5eb'};
`;

export const Notifications: React.FC<NotificationsProps> = ({
  attemptedConnect,
  hasAvailableNetworks,
  error,
}) => {
  return (
    <NotificationContainer>
      {error && (
        <Alert $variant="error" role="alert">
          {error}
        </Alert>
      )}

      {attemptedConnect && !error && (
        <Alert $variant="success" role="alert">
          Connecting to WiFi network...
        </Alert>
      )}

      {!hasAvailableNetworks && !error && (
        <Alert $variant="info" role="alert">
          No WiFi networks found.
        </Alert>
      )}
    </NotificationContainer>
  );
}; 