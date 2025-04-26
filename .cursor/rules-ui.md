# Next.js Project Rules - WiFi Connect

## Development and Build Guidelines

### Directory Structure for UI
- All UI code must reside in the `/ui` directory
- Use the App Router pattern with `/ui/src/app` directory structure
- Place components in `/ui/src/components`
- Store types in `/ui/src/types`
- Keep styles in `/ui/src/styles`
- Utility functions go in `/ui/src/lib`

### Running the UI Application
- Always run commands from the `/ui` directory:
  ```bash
  cd ui
  npm run dev    # Development server
  npm run build  # Production build
  npm start      # Run production build
  ```

### Code Quality and Standards
- Use TypeScript for all new code
- Add proper typing to all components, props, and function parameters
- Use React functional components with hooks
- Add JSDoc comments to functions and components for better documentation

### Styling Guidelines
- Use styled-components for component styling
- Always use transient props (with $ prefix) to avoid React warnings:
  ```tsx
  // CORRECT
  const StyledButton = styled.button<{ $primary: boolean }>`
    color: ${props => props.$primary ? 'blue' : 'black'};
  `;
  
  // AVOID
  const StyledButton = styled.button<{ primary: boolean }>`
    color: ${props => props.primary ? 'blue' : 'black'};
  `;
  ```
- Import the theme from `@/styles/theme` for consistent styling

### Avoid Deprecations
- Do not use the Pages Router (use App Router instead)
- Avoid using `getInitialProps` or `getServerSideProps` in App Router
- Do not use the `rendition` library
- Use the latest styled-components syntax
- Always check for newer alternatives when using third-party packages
- Run `npm audit` regularly to check for package vulnerabilities

### Component Best Practices
- Break down large components into smaller, reusable pieces
- Use proper prop validation with TypeScript interfaces
- Implement proper error handling for async operations
- Use the React hooks API correctly (useEffect, useState, useMemo, useCallback)
- Follow the single responsibility principle

### Performance Optimization
- Use Next.js Image component for optimized images
- Implement code splitting with dynamic imports
- Optimize re-renders with React.memo, useMemo, and useCallback
- Lazy load components when appropriate

### Build Process
- Always run `npm run build` before deploying to production
- Address all TypeScript errors before deploying
- Fix all styled-components warnings before production deployment

### Package Management
- Use package versions with exact matches to avoid unexpected updates
- Run `npm audit fix` to address security vulnerabilities
- Document any package version changes in commit messages

## Troubleshooting
- If you encounter path alias errors (@/), check that `tsconfig.json` has proper path configurations
- For styled-components issues, ensure the registry setup is correct in `/ui/src/lib/registry.tsx`
- If the build fails, check the Next.js configuration in `next.config.mjs` 