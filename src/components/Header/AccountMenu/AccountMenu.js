import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppContext from '../../../AppContext';

const AccountMenu = () => {
  const app = useContext(AppContext);
  const { register, login, logout } = app.auth;

  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);

  const loggedIn = app.trader.id != null;

  const defaultProfileThumbnail = `${process.env.PUBLIC_URL}/imgs/default-profile-thumbnail.png`;
  const [profileThumbnail, setProfileThumbnail] = useState(defaultProfileThumbnail);
  useEffect(() => {
    (async () => {
      if (app.trader.id) {
        const { url } = await app.trader.get('profilePhoto', { size: 'thumbnail' });
        setProfileThumbnail(url);
      }
    })();
  }, [app.trader.id]);

  if (!loggedIn) {
    return (
      <div className="account-login-register">
        <button type="button" className="login" onClick={login}>Login</button>
        <button type="button" className="logout" onClick={register}>Sign Up</button>
      </div>
    );
  }

  return (
    <div className="account-menu-wrap">
      <button
        aria-label={`${(!open) ? 'Close' : 'Open'} Account Dropdown`}
        type="button"
        onClick={toggleOpen}
      >
        <div className="profilePhoto">
          <img src={profileThumbnail} alt="Your Profile Pic" />
        </div>

        <div className="down-arrow">
          <img
            src={`${process.env.PUBLIC_URL}/imgs/down-arrow.svg`}
            alt="Open Account Dropdown"
          />
        </div>
      </button>

      <div className={`account-menu ${(open) ? 'account-menu-open' : ''}`}>
        <ul>
          <li><Link to="/account">Account Settings</Link></li>
          <li>
            <button type="button" onClick={logout}>Logout</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AccountMenu;
