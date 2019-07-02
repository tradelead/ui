import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { push as Menu } from 'react-burger-menu';
import AppContext from './AppContext';

import DashboardScreen from './screens/Dashboard/DashboardScreen';
import LeaderboardScreen from './screens/Leaderboard/LeaderboardScreen';
import { TraderProfileScreen } from './screens/TraderProfile/TraderProfileScreen';
import AccountScreen from './screens/Account/AccountScreen';
import Header from './components/Header/Header';
import { HeaderContainer } from './components/Header/HeaderContainer';

function App({ auth }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => {
    setMenuOpen(false);
  };

  const [user, setUser] = useState({});

  useEffect(() => {
    (async () => {
      try {
        setUser(await auth.current());
      } catch (e) {
        console.error(e);
      }
    })();

    const updateUser = async () => {
      try {
        setUser(await auth.current());
      } catch (e) {
        console.error(e);
      }
    };
    auth.on('authUpdate', updateUser);

    return () => {
      auth.removeListener('authUpdate', updateUser);
    };
  }, [auth]);

  const ctx = {
    closeMenu,
    user,
    auth,
  };

  return (
    <AppContext.Provider value={ctx}>
      <Router>
        <div id="App" className="App">
          <Menu
            right
            pageWrapId="page-wrap"
            outerContainerId="App"
            isOpen={menuOpen}
            onStateChange={state => setMenuOpen(state.isOpen)}
          >
            <Header />
          </Menu>

          <div id="page-wrap">
            <div className="header">
              <HeaderContainer />
            </div>
            <Route path="/" exact component={DashboardScreen} />
            <Route path="/leaders" component={LeaderboardScreen} />
            <Route path="/trader/:username" component={TraderProfileScreen} />
            <Route path="/account" component={AccountScreen} />
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

App.propTypes = {
  auth: PropTypes.shape({
    current: PropTypes.func.isRequired,
    getAccessToken: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
  }).isRequired,
};

export default App;
