import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema, type RegisterFormData } from './schemas';
import './auth.css';

const Register: React.FC = () => {
    const { register: authRegister, error: authError, isLoading } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await authRegister(data);
            navigate('/login');
        } catch (err) {
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Register</h2>
            {authError && (
                <div className="auth-error">
                    {authError}
                </div>
            )}
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        {...register('username')}
                    />
                    {errors.username && <span className="error-text">{errors.username.message}</span>}
                </div>
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
                        placeholder="Create a password"
                        {...register('password')}
                    />
                    {errors.password && <span className="error-text">{errors.password.message}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="imgUrl">Profile Image URL (Optional)</label>
                    <input
                        id="imgUrl"
                        type="text"
                        placeholder="https://example.com/avatar.jpg"
                        {...register('imgUrl')}
                    />
                    {errors.imgUrl && <span className="error-text">{errors.imgUrl.message}</span>}
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