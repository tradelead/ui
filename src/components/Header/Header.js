import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import './Header.css';
import { NavLink } from 'react-router-dom';
import LabeledBadge from './LabeledBadge/LabeledBadge';
import AccountMenu from './AccountMenu/AccountMenu';
import AppContext from '../../AppContext';

const Header = ({
  user,
  score,
  rank,
  profilePhoto,
}) => {
  const ctx = useContext(AppContext);
  const curUser = ctx.user;
  const { closeMenu } = ctx;

  return (
    <div className="header-inner">
      <div className="branding">
        <img src={`${process.env.PUBLIC_URL}/imgs/logo.svg`} alt="TradeLead" />
      </div>

      <ul className="navigation">
        {curUser.id && (
          <li><NavLink onClick={closeMenu} exact activeClassName="active" to="/">Performance</NavLink></li>
        )}
        <li><NavLink onClick={closeMenu} activeClassName="active" to="/leaders">Leaders</NavLink></li>
      </ul>

      {(score) ? <LabeledBadge className="score" label="Score" value={score} /> : ''}
      {(rank) ? <LabeledBadge className="rank" label="Rank" value={rank} /> : ''}

      <AccountMenu user={user} profilePhoto={profilePhoto} closeMenu={closeMenu} />
    </div>
  );
};

Header.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
  }),
  score: PropTypes.number,
  rank: PropTypes.number,
  profilePhoto: PropTypes.string,
};

Header.defaultProps = {
  user: {},
  score: null,
  rank: null,
  profilePhoto: '',
};

export default Header;
