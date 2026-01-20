import { useAuth } from './context/AuthContext';
import './App.css'

function App() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      <h1>Frontend Infrastructure Ready</h1>
      <div className="status-card">
        <h2>Auth Status</h2>
        <p>Is Authenticated: <strong>{isAuthenticated ? 'Yes' : 'No'}</strong></p>
        {user && <pre>{JSON.stringify(user, null, 2)}</pre>}
      </div>
      <p>Services are located in <code>src/services</code></p>
    </div>
  )
}

export default App