import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import './Profile.css';
import defaultProfilePicture from '../../assets/default-pfp.svg';
import type { IImage } from '../../types';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const getProfileImageUrl = () => {
    if (user.profileImage) {
      return (user.profileImage as IImage).url;
    }
    return user.imgUrl || defaultProfilePicture;
  };

  return (
    <div className="profile-container">
      <h2>{user.username}</h2>
      <img 
        src={getProfileImageUrl()} 
        alt="Profile" 
        className="profile-avatar"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.src = defaultProfilePicture;
        }}
      />
      <div className="profile-info">
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <Link to="/edit-profile">
        <button className="edit-profile-button">Edit Profile</button>
      </Link>
    </div>
  );
};

export default Profile;
