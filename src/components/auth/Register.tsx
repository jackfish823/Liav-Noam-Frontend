import React, {useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {useNavigate, Link} from 'react-router-dom';
import './auth.css';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [imgUrl, setImgUrl] = useState('');

    const {register, error: authError, isLoading} = useAuth();
    const [localError, setLocalError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!username || !email || !password) {
            setLocalError("Please fill in all required fields.");
            return;
        }

        try {
            await register({username, email, password, imgUrl});
            navigate('/login');
        } catch (err) {
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Register</h2>
            {(authError || localError) && (
                <div className="auth-error">
                    {localError || authError}
                </div>
            )}
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        required
                    />
                </div>
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
                        placeholder="Create a password"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="imgUrl">Profile Image URL (Optional)</label>
                    <input
                        type="text"
                        id="imgUrl"
                        value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <div className="auth-switch">
                Already have an account? <Link to="/login">Login here</Link>
            </div>
        </div>
    );
};

export default Register;
