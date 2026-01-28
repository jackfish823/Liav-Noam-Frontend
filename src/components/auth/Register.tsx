import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { validateImageFile } from '../../services/image.service';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema, type RegisterFormData } from './schemas';
import './auth.css';

const Register: React.FC = () => {
    const { register: authRegister, error: authError, isLoading } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const validation = validateImageFile(file);

        if (!validation.valid) {
            setImageError(validation.error || 'Invalid file');
            setSelectedFile(null);
            setPreviewUrl(null);

            return;
        }

        setImageError(null);
        setSelectedFile(file);

        const preview = URL.createObjectURL(file);

        setPreviewUrl(preview);
    };

    const handleRemoveImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        
        setSelectedFile(null);
        setPreviewUrl(null);
        setImageError(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await authRegister(data, selectedFile);
            
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            
            navigate('/login');
        } catch (err) {
            // Error is handled by AuthContext
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
                    <label htmlFor="profileImage">Profile Image (Optional)</label>
                    <input
                        ref={fileInputRef}
                        id="profileImage"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                    {imageError && <span className="error-text">{imageError}</span>}
                    
                    {previewUrl && (
                        <div className="image-preview">
                            <img src={previewUrl} alt="Profile preview" />
                            <button 
                                type="button" 
                                onClick={handleRemoveImage}
                                className="remove-image-btn"
                            >
                                Remove
                            </button>
                        </div>
                    )}
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