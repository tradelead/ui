import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import './Header.css';
import { NavLink } from 'react-router-dom';
import useTraderInfo from '../../hooks/useTraderInfo';
import LabeledBadge from './LabeledBadge/LabeledBadge';
import AccountMenu from './AccountMenu/AccountMenu';
import AppContext from '../../AppContext';

const Header = ({ closeMenu }) => {
  const app = useContext(AppContext);
  const [info] = useTraderInfo(app.trader, ['score', 'rank']);

  return (
    <div className="header-inner">
      <div className="branding">
        <img src={`${process.env.PUBLIC_URL}/imgs/logo.svg`} alt="TradeLead" />
      </div>

      <ul className="navigation">
        <li><NavLink onClick={closeMenu} exact activeClassName="active" to="/">Performance</NavLink></li>
        <li><NavLink onClick={closeMenu} activeClassName="active" to="/leaders">Leaders</NavLink></li>
      </ul>

      {(info.score) ? <LabeledBadge className="score" label="Score" value={info.score} /> : ''}
      {(info.rank) ? <LabeledBadge className="rank" label="Rank" value={info.rank} /> : ''}

      <AccountMenu closeMenu={closeMenu} />
    </div>
  );
};

Header.propTypes = {
  closeMenu: PropTypes.func,
};

Header.defaultProps = {
  closeMenu: () => {},
};

export default Header;
