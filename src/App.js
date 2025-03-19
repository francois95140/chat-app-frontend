import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Join from './components/Join';
import Chat from './components/Chat';
import './App.css';

function App() {
  return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Join />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;