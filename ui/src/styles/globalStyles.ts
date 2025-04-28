import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyles = createGlobalStyle`
  /* Base styles */
  html,
  body {
    padding: 0;
    margin: 0;
    font-family: ${theme.fonts.body};
    color: ${theme.colors.text};
    background-color: ${theme.colors.background};
    line-height: 1.6;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.fonts.heading};
    margin-top: 0;
    line-height: 1.2;
  }
  
  h1 {
    font-size: ${theme.fontSizes.xxlarge};
  }
  
  h2 {
    font-size: ${theme.fontSizes.xlarge};
  }
  
  h3 {
    font-size: ${theme.fontSizes.large};
  }
  
  p {
    margin-top: 0;
    margin-bottom: ${theme.spacing.medium};
  }

  /* Links */
  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s;
  }

  a:hover {
    color: ${theme.colors.primaryDark};
    text-decoration: underline;
  }

  /* Buttons and interactive elements */
  button {
    cursor: pointer;
    font-family: ${theme.fonts.body};
  }
  
  button:disabled {
    cursor: not-allowed;
  }

  /* Forms */
  input, select, textarea {
    font-family: ${theme.fonts.body};
  }
  
  /* Box model */
  * {
    box-sizing: border-box;
  }
  
  /* Accessibility */
  :focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
  
  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

export default GlobalStyles; 