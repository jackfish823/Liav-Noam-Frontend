import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useAuth} from '../../hooks/useAuth';
import {useNavigate, Link} from 'react-router-dom';
import {loginSchema, type LoginFormData} from './schemas';
import {useGoogleLogin} from '@react-oauth/google';
import googleIcon from '../../assets/google.svg';
import './auth.css';

const Login: React.FC = () => {
    const {login, googleLogin, error: authError, isLoading} = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data);
            navigate('/');
        } catch (err) {
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                await googleLogin(tokenResponse.access_token);
                navigate('/');
            } catch (err) {
                console.error('Google login error:', err);
            }
        },
        onError: () => {
            console.error('Google login failed');
        },
    });

    return (
        <div className="auth-container">
            <h2 className="auth-title">Login</h2>
            {authError && (
                <div className="auth-error">
                    {authError}
                </div>
            )}
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...register('email')}
                    />
                    {errors.email && <span className="error-text">{errors.email.message}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        {...register('password')}
                    />
                    {errors.password && <span className="error-text">{errors.password.message}</span>}
                </div>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <div className="auth-switch">
                Don't have an account? <Link to="/register">Register here</Link>
            </div>
            <div className="auth-divider">
                <span>or sign in with google</span>
            </div>
            <button 
                type="button" 
                className="google-btn" 
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
            >
                <img src={googleIcon} alt="Google" width="18" height="18" />
                Continue with Google
            </button>
        </div>
    );
};

export default Login;