import React from 'react';
import styled from 'styled-components';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import FloatingToolbar from './components/FloatingToolbar';
import { CanvasProvider } from './context/CanvasContext';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
`;

const App = () => {
  return (
    <CanvasProvider>
      <AppContainer>
        <Toolbar />
        <Canvas />
        <FloatingToolbar type="text" />
        <FloatingToolbar type="shape" />
        <FloatingToolbar type="image" />
      </AppContainer>
    </CanvasProvider>
  );
};

export default App;