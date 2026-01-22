import React, {useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {useNavigate, Link} from 'react-router-dom';
import './auth.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const {login, error: authError, isLoading} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!email || !password) {
            setLocalError("Please fill in all fields.");
            return;
        }

        try {
            await login({email, password});
            navigate('/');
        } catch (err) {
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Login</h2>
            {(authError || localError) && (
                <div className="auth-error">
                    {localError || authError}
                </div>
            )}
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <div className="auth-switch">
                Don't have an account? <Link to="/register">Register here</Link>
            </div>
        </div>
    );
};

export default Login;
