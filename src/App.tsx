import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/user/Profile';
import EditProfile from './components/user/EditProfile';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
        return <div className="loading-spinner">Loading...</div>;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const Home = () => {
    const { user, logout } = useAuth();
    
    return (
        <div className="app-container">
            <h1>Frontend Infrastructure Ready</h1>
            <div className="card">
                <h2>Welcome, {user?.username || 'User'}!</h2>
                <div style={{ textAlign: 'left', margin: '1rem 0' }}>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>ID:</strong> {user?._id}</p>
                    {user?.imgUrl && (
                        <div>
                            <strong>Avatar:</strong><br/>
                            <img 
                                src={user.imgUrl} 
                                alt="Profile" 
                                style={{
                                    width: '100px', 
                                    height: '100px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover',
                                    marginTop: '0.5rem'
                                }} 
                            />
                        </div>
                    )}
                </div>
                <Link to="/profile">
                    <button>View Profile</button>
                </Link>
                <button onClick={() => logout()}>Logout</button>
            </div>
        </div>
    );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
        <Route path="/edit-profile" element={
            <ProtectedRoute>
                <EditProfile />
            </ProtectedRoute>
        } />
    </Routes>
  );
}

export default App;
