import React from 'react';
import styled from 'styled-components';
import Button from './Button';

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
`;

const ButtonContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
`;

export const ConnectContainer: React.FC = () => {
  return (
    <Container>
      <Title>WiFi Connect</Title>
      <p>This is a simple WiFi connection utility.</p>
      <ButtonContainer>
        <Button>Connect</Button>
      </ButtonContainer>
    </Container>
  );
}; 