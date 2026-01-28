import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import ImageUpload from '../ImageUpload';
import './Profile.css';
import type { IImage } from '../../types';

interface IFormInput {
  username: string;
  email: string;
  profileImage?: string | null;
}

const EditProfile: React.FC = () => {
  const { user, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch } = useForm<IFormInput>();
  
  const profileImageValue = watch('profileImage');

  useEffect(() => {
    if (user) {
      setValue('username', user.username);
      setValue('email', user.email);

      if (user.profileImage) {
        setValue('profileImage', (user.profileImage as IImage).id);
      }
    }
  }, [user, setValue]);

  const handleImageUploaded = (imageId: string) => {
    setValue('profileImage', imageId);
  };

  const handleImageRemoved = () => {
    setValue('profileImage', null);
  };

  const onSubmit = async (data: IFormInput) => {
    if (!user) return;

    try {
      const updateData: any = {
        username: data.username,
        email: data.email,
      };

      if ('profileImage' in data) {
        updateData.profileImage = data.profileImage;
      }

      await updateUser(updateData);

      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const getCurrentImageUrl = () => {
    if (!user) return undefined;
    if (profileImageValue === null) return undefined; // User removed it
    if (user.profileImage) {
      return (user.profileImage as IImage).url;
    }
    return user.imgUrl;
  };

  if (!user) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h2>Edit Profile</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
        <ImageUpload
          label="Profile Picture"
          shape="circle"
          currentImageUrl={getCurrentImageUrl()}
          onImageUploaded={handleImageUploaded}
          onImageRemoved={handleImageRemoved}
          disabled={isLoading}
        />

        <div className="form-group">
          <label htmlFor="username">Name</label>
          <input
            id="username"
            type="text"
            {...register('username')}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="save-button" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      
      <Link to="/profile" style={{ width: '100%', marginTop: '1rem' }}>
        <button className="cancel-button" disabled={isLoading}>Cancel</button>
      </Link>
    </div>
  );
};

export default EditProfile;

