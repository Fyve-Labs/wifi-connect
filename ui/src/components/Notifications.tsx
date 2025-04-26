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

type AlertType = 'warning' | 'danger' | 'info';

const Alert = styled.div<{ $type: AlertType }>`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  
  background-color: ${({ $type }: { $type: AlertType }) => 
    $type === 'warning' ? '#FFF3CD' : 
    $type === 'danger' ? '#F8D7DA' : 
    '#D1ECF1'};
  
  border: 1px solid ${({ $type }: { $type: AlertType }) => 
    $type === 'warning' ? '#FFEEBA' : 
    $type === 'danger' ? '#F5C6CB' : 
    '#BEE5EB'};
  
  color: ${({ $type }: { $type: AlertType }) => 
    $type === 'warning' ? '#856404' : 
    $type === 'danger' ? '#721C24' : 
    '#0C5460'};
`;

const AlertIcon = styled.div<{ $type: AlertType }>`
  color: ${({ $type }: { $type: AlertType }) => 
    $type === 'warning' ? '#F5A623' : 
    $type === 'danger' ? '#DC3545' : 
    '#17A2B8'};
  font-size: 1.25rem;
  margin-top: 0.125rem;
`;

const AlertContent = styled.div`
  flex: 1;
  
  strong {
    font-weight: 600;
    margin-right: 0.5rem;
  }
`;

export const Notifications: React.FC<NotificationsProps> = ({
  attemptedConnect,
  hasAvailableNetworks,
  error,
}) => {
  return (
    <NotificationContainer>
      {error && (
        <Alert $type="danger" role="alert">
          <AlertIcon $type="danger">⛔</AlertIcon>
          <AlertContent>
            <strong>Danger!</strong> {error}
          </AlertContent>
        </Alert>
      )}

      {!hasAvailableNetworks && !error && (
        <Alert $type="warning" role="alert">
          <AlertIcon $type="warning">⚠️</AlertIcon>
          <AlertContent>
            <strong>Warning!</strong> No wifi networks available. Please ensure there is a network within range and reboot the device.
          </AlertContent>
        </Alert>
      )}

      {attemptedConnect && !error && (
        <Alert $type="info" role="alert">
          <AlertIcon $type="info">ℹ️</AlertIcon>
          <AlertContent>
            <strong>Connecting...</strong> Your device will soon be online. If connection is unsuccessful, the access point will be back up in a few minutes.
          </AlertContent>
        </Alert>
      )}
    </NotificationContainer>
  );
}; 