import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';
import defaultProfilePicture from '../../assets/default-pfp.svg';

interface IFormInput {
  username: string;
  email: string;
  imgUrl: string;
}

const EditProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch } = useForm<IFormInput>();
  const watchedImgUrl = watch('imgUrl');

  useEffect(() => {
    if (user) {
      setValue('username', user.username);
      setValue('email', user.email);
      setValue('imgUrl', user.imgUrl || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: IFormInput) => {
    if (user) {
      try {
        await updateUser(data);
        navigate('/profile');
      } catch (error) {
        console.error('Failed to update profile', error);
      }
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <img
        src={watchedImgUrl || user.imgUrl || defaultProfilePicture}
        alt="Profile"
        className="profile-avatar"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.src = defaultProfilePicture;
        }}
      />
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
        <div className="form-group">
          <label htmlFor="username">Name</label>
          <input
            id="username"
            type="text"
            {...register('username')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="imgUrl">Image URL</label>
          <input
            id="imgUrl"
            type="text"
            {...register('imgUrl')}
          />
        </div>
        <button type="submit" className="save-button">Save</button>
      </form>
      <Link to="/profile" style={{ width: '100%', marginTop: '1rem' }}>
        <button className="cancel-button">Cancel</button>
      </Link>
    </div>
  );
};

export default EditProfile;

