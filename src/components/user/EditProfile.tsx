import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';
import defaultProfilePicture from '../../assets/default-pfp.svg';

const EditProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setImgUrl(user.imgUrl || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        await updateUser({ username, email, imgUrl });
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
        src={imgUrl || user.imgUrl || defaultProfilePicture} 
        alt="Profile" 
        className="profile-avatar" 
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.src = defaultProfilePicture;
        }}
      />
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="username">Name</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="imgUrl">Image URL</label>
          <input
            id="imgUrl"
            type="text"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
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

