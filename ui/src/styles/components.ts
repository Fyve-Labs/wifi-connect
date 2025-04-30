import styled from 'styled-components';
import theme from './theme';

interface Theme {
  colors: {
    primary: string;
    background: string;
    text: string;
  };
}

// Layout components
export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

export const Header = styled.header`
  background-color: ${({ theme }: { theme: Theme }) => theme.colors.text};
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
`;

export const Logo = styled.div`
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

// Form components
export const FormContainer = styled.div`
  margin-top: 2rem;
`;

export const Heading = styled.h2`
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }: { theme: Theme }) => theme.colors.text};
`;

export const Form = styled.form`
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-weight: 500;
  color: #555;
`;

export const Select = styled.select`
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

export const InputContainer = styled.div`
  position: relative;
`;

export const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
`;

export const TogglePasswordButton = styled.button`
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

// Button components
export const Button = styled.button`
  font-weight: 600;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled(Button)`
  background-color: ${theme.colors.primary || '#a5d8f3'};
  color: ${({ theme }: { theme: Theme }) => theme.colors.text};
  padding: 1rem;
  
  &:hover:not(:disabled) {
    background-color: ${theme.colors.primaryDark || '#8ecbec'};
  }
`;

export const SecondaryButton = styled(Button)`
  background-color: #f0f0f0;
  color: ${({ theme }: { theme: Theme }) => theme.colors.text};
  padding: 0.75rem;
  
  &:hover:not(:disabled) {
    background-color: #e0e0e0;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// Dialog components
export interface DialogButtonProps {
  primary?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const DialogContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
`;

export const DialogTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: ${({ theme }: { theme: Theme }) => theme.colors.text};
`;

export const DialogText = styled.p`
  margin-bottom: 1.5rem;
  color: #555;
  line-height: 1.5;
`;

export const DialogButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

export const DialogButton = styled.button<DialogButtonProps>`
  background-color: ${(props: DialogButtonProps) => props.primary ? theme.colors.primary || '#a5d8f3' : '#f0f0f0'};
  color: ${({ theme }: { theme: Theme }) => theme.colors.text};
  font-weight: 600;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${(props: DialogButtonProps) => props.primary ? theme.colors.primaryDark || '#8ecbec' : '#e0e0e0'};
  }
`;

// Spinner components
export const SpinnerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const Spinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid ${theme.colors.primary || '#3498db'};
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const SpinnerText = styled.p`
  color: ${({ theme }: { theme: Theme }) => theme.colors.text};
  font-weight: 500;
`;

export const BrandText = styled.h2`
  color: ${({ theme }: { theme: Theme }) => theme.colors.background};
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin: 1rem 0;
`; 