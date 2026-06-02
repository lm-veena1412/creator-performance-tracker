import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SidebarLayout from './layouts/SidebarLayout'; // 👈 Import the new layout
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Creators from './pages/Creators';
import PerformanceLogs from './pages/PerformanceLogs';
import Analytics from './pages/Analytics';

// ... (Your ProtectedRoute component stays the same) ...

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes (No Sidebar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Protected Routes (Wrapped inside the Sidebar Layout!) */}
          <Route element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
            
            {/* Everything in here will render on the right side of the screen */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* You can build these empty placeholder pages later! */}
            <Route path="/creators" element={<Creators />} />
            <Route path="/logs" element={<PerformanceLogs />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<div className="p-8"><h1 className="text-3xl font-bold">Settings Coming Soon</h1></div>} />
          
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;