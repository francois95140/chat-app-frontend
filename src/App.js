import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Join from './components/Join';
import Chat from './components/Chat';
import './App.css';
import NotificationSystem from "./components/Notification";

function App() {
  return (
      <Router>
        <div className="App">
            <NotificationSystem />
          <Routes>
            <Route path="/" element={<Join />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;