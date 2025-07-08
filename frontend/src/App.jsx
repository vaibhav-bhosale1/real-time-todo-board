import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import KanbanBoard from './components/KanbanBoard/KanbanBoard'; // Will create this later
import PrivateRoute from './utils/PrivateRoute'; // Our private route component
import './App.css'; // App-wide styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Protected route for Kanban Board */}
        <Route
          path="/board"
          element={
            <PrivateRoute>
              <KanbanBoard />
            </PrivateRoute>
          }
        />
        {/* Redirect to login if no specific route is matched for authenticated users,
            otherwise to /login */}
        <Route path="/" element={<Navigate to="/board" />} /> {/* Default route */}
        <Route path="*" element={<Navigate to="/login" />} /> {/* Catch-all for non-existent routes */}
      </Routes>
    </Router>
  );
}

export default App;