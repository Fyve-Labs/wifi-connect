import React from 'react';
import styled from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}

interface ThemeType {
  colors?: {
    primary?: string;
    primaryDark?: string;
    secondary?: string;
    secondaryDark?: string;
  };
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;
  white-space: nowrap;
  
  /* Width */
  width: ${({ $fullWidth }: StyledButtonProps) => ($fullWidth ? '100%' : 'auto')};
  
  /* Sizes */
  padding: ${({ $size }: StyledButtonProps) =>
    $size === 'small'
      ? '8px 16px'
      : $size === 'medium'
      ? '10px 20px'
      : '12px 24px'};
  font-size: ${({ $size }: StyledButtonProps) =>
    $size === 'small'
      ? '14px'
      : $size === 'medium'
      ? '16px'
      : '18px'};
  
  /* Variants */
  background-color: ${({ $variant, theme }: StyledButtonProps & { theme: ThemeType }) =>
    $variant === 'primary'
      ? theme.colors?.primary || '#007bff'
      : $variant === 'secondary'
      ? theme.colors?.secondary || '#6c757d'
      : 'transparent'};
  color: ${({ $variant, theme }: StyledButtonProps & { theme: ThemeType }) =>
    $variant === 'outline'
      ? theme.colors?.primary || '#007bff'
      : '#ffffff'};
  border: ${({ $variant, theme }: StyledButtonProps & { theme: ThemeType }) =>
    $variant === 'outline'
      ? `1px solid ${theme.colors?.primary || '#007bff'}`
      : 'none'};
  
  &:hover {
    background-color: ${({ $variant, theme }: StyledButtonProps & { theme: ThemeType }) =>
      $variant === 'primary'
        ? theme.colors?.primaryDark || '#0069d9'
        : $variant === 'secondary'
        ? theme.colors?.secondaryDark || '#5a6268'
        : 'rgba(0, 123, 255, 0.1)'};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 