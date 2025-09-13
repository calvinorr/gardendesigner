import React from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import Header from './components/Layout/Header';
import MapContainer from './components/Map/MapContainer';
import './App.css';

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <div className="App">
        <Header />
        <main className="App-main">
          <MapContainer />
        </main>
      </div>
    </FluentProvider>
  );
}

export default App;
