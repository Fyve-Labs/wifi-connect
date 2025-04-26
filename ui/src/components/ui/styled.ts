import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`;

export const Navbar = styled.header`
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const NavbarBrand = styled.div`
  height: 30px;
  img {
    height: 100%;
  }
`;

export const FormContainer = styled.div`
  margin: 1rem;
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const FormWrapper = styled.form`
  width: 60%;
  max-width: 500px;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

export const SubmitButton = styled.button<{ disabled?: boolean }>`
  width: 60%;
  margin-left: 20%;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: ${(props: { disabled?: boolean }) => props.disabled ? '#cccccc' : '#0094d6'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: ${(props: { disabled?: boolean }) => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${(props: { disabled?: boolean }) => props.disabled ? '#cccccc' : '#0077aa'};
  }
`;

export const Heading = styled.h3`
  text-align: center;
  margin-bottom: 1rem;
`;

export const Alert = styled.div<{ 
  variant: 'info' | 'warning' | 'danger' 
}>`
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 4px;
  color: #000;
  background-color: ${(props: { variant: 'info' | 'warning' | 'danger' }) => {
    switch (props.variant) {
      case 'info': return '#e3f2fd';
      case 'warning': return '#fff3cd';
      case 'danger': return '#f8d7da';
      default: return '#e3f2fd';
    }
  }};
  border: 1px solid ${(props: { variant: 'info' | 'warning' | 'danger' }) => {
    switch (props.variant) {
      case 'info': return '#b3e5fc';
      case 'warning': return '#ffeeba';
      case 'danger': return '#f5c6cb';
      default: return '#b3e5fc';
    }
  }};
`; 