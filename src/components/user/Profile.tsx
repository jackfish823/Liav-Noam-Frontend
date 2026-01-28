import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import './Profile.css';
import defaultProfilePicture from '../../assets/default-pfp.svg';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <img 
        src={user.imgUrl || defaultProfilePicture} 
        alt="Profile" 
        className="profile-avatar" 
      />
      <div className="profile-info">
        <p><strong>Name:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <Link to="/edit-profile">
        <button className="edit-profile-button">Edit Profile</button>
      </Link>
      <Link to="/" style={{ width: '100%', marginTop: '1rem' }}>
        <button className="edit-profile-button">Back to Home</button>
      </Link>
    </div>
  );
};

export default Profile;
