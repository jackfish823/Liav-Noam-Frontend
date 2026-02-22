import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import defaultProfilePicture from '../../assets/default-pfp.svg';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const profileImg = user?.profileImage?.url || user?.imgUrl || defaultProfilePicture;

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [dropdownOpen]);

    const handleLogout = async () => {
        setDropdownOpen(false);
        await logout();
        navigate('/login');
    };

    return (
        <header className="topbar">
                <Link to="/" className="topbar-brand">Postman</Link>

            <div className="topbar-right">
                <Link to="/posts/create" className="topbar-newpost">+ New Post</Link>

                <div className="topbar-avatar-wrap" ref={menuRef}>
                    <img
                        src={profileImg}
                        alt={user?.username || 'User'}
                        className="topbar-avatar"
                        onClick={() => setDropdownOpen(v => !v)}
                        onError={(e) => { e.currentTarget.src = defaultProfilePicture; }}
                    />

                    {dropdownOpen && (
                        <div className="topbar-dropdown">
                            <div className="topbar-dropdown-user">
                                <span className="topbar-dropdown-name">{user?.username}</span>
                                <span className="topbar-dropdown-email">{user?.email}</span>
                            </div>
                            <hr className="topbar-dropdown-hr" />
                            <Link to="/profile" className="topbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                Profile
                            </Link>
                            <Link to="/my-posts" className="topbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                Posts
                            </Link>
                            <hr className="topbar-dropdown-hr" />
                            <button className="topbar-dropdown-item topbar-dropdown-logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
