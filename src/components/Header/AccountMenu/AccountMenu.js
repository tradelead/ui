import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AppContext from '../../../AppContext';
import TraderImg from '../../TraderImg/TraderImg';

const AccountMenu = ({ closeMenu }) => {
  const app = useContext(AppContext);
  const {
    register,
    login,
    logout,
    settingsUrl,
  } = app.auth;

  const port = window.location.port ? `:${window.location.port}` : '';
  const accountUrl = `${window.location.protocol}//${window.location.host}${port}/account`;

  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);

  const loggedIn = app.trader.id != null;

  useOutsideClicksCloseMenu(setOpen);

  if (!loggedIn) {
    return (
      <div className="account-login-register">
        <button type="button" className="login" onClick={() => { login(); closeMenu(); }}>Login</button>
        <button type="button" className="signup" onClick={() => { register(accountUrl); closeMenu(); }}>Sign Up</button>
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
          <TraderImg trader={app.trader} size="thumbnail" />
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
              target="_blank"
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
  closeMenu: PropTypes.func,
};

AccountMenu.defaultProps = {
  closeMenu: () => {},
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
