import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AppContext from '../../../AppContext';
import TraderImg from '../../TraderImg/TraderImg';

const AccountMenu = ({ user, profilePhoto }) => {
  const app = useContext(AppContext);

  const {
    register,
    login,
    logout,
    settingsUrl,
  } = app.auth;

  const { closeMenu } = app;

  const accountUrl = `${window.location.protocol}//${window.location.host}/account`;

  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);

  const loggedIn = user.id != null;

  useOutsideClicksCloseMenu(setOpen);

  if (!loggedIn) {
    return (
      <div className="account-login-register">
        <button type="button" className="login btn btn-primary" onClick={() => { login(); closeMenu(); }}>Login</button>
        <button type="button" className="signup btn btn-primary" onClick={() => { register(accountUrl); closeMenu(); }}>Sign Up</button>
      </div>
    );
  }

  return (
    <div className="account-menu-wrap">
      <button
        aria-label={`${(!open) ? 'Open' : 'Close'} Account Dropdown`}
        type="button"
        className="toggle-account-menu"
        onClick={toggleOpen}
      >
        <div className="profilePhoto">
          <TraderImg src={profilePhoto} alt={user.username} />
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
          <li><Link onClick={closeMenu} to="/account">Account Settings</Link></li>
          <li>
            <a
              className="loginSettings"
              href={settingsUrl}
              rel="noopener noreferrer"
            >
              Login Settings
            </a>
          </li>
          <li>
            <button type="button" className="logout" onClick={() => { logout(); closeMenu(); }}>Logout</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

AccountMenu.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  profilePhoto: PropTypes.string,
};

AccountMenu.defaultProps = {
  user: {},
  profilePhoto: '',
};

function useOutsideClicksCloseMenu(setOpen) {
  useEffect(() => {
    const shouldIfNotWithinMenu = (event) => {
      if (!event.target.closest('.account-menu-wrap')) {
        setOpen(false);
      }
    };

    document.addEventListener('click', shouldIfNotWithinMenu);
    return () => document.removeEventListener('click', shouldIfNotWithinMenu);
  }, []);
}

export default AccountMenu;
