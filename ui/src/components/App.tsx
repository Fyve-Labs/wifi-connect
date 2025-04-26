import React from 'react';
import styled from 'styled-components';
import { ConnectContainer } from './ConnectContainer';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
	body {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
			Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
`;

const AppContainer = styled.div`
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #f5f5f5;
`;

const Header = styled.header`
	background-color: #fff;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	padding: 1rem 2rem;
	display: flex;
	align-items: center;
`;

const Title = styled.h1`
	font-size: 1.5rem;
	margin: 0;
	color: #333;
`;

const Main = styled.main`
	flex: 1;
	padding: 2rem;
`;

const App: React.FC = () => {
	return (
		<AppContainer>
			<GlobalStyle />
			<Header>
				<Title>WiFi Connect</Title>
			</Header>
			<Main>
				<ConnectContainer />
			</Main>
		</AppContainer>
	);
};

export default App;
