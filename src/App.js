import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { push as Menu } from 'react-burger-menu';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloProviderHooks } from 'react-apollo-hooks';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import LeaderboardScreen from './screens/Leaderboard/LeaderboardScreen';
import { TraderProfileScreen } from './screens/TraderProfile/TraderProfileScreen';
import AccountScreen from './screens/Account/AccountScreen';
import Header from './components/Header/Header';
import AppContext from './AppContext';
import { HeaderContainer } from './components/Header/HeaderContainer';
import mockClient from './mockClient';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => { setMenuOpen(false); };

  // mock auth
  const auth = {
    current: async () => ({
      id: 'trader123',
      username: 'tradername123',
    }),
    on: () => {},
    login: () => {},
    register: () => {},
    logout: () => {},
  };

  const [user, setUser] = useState({});

  useEffect(() => {
    (async () => {
      setUser(await auth.current());
    })();

    auth.on('authUpdate', async () => {
      setUser(await auth.current());
    });
  }, []);

  const ctx = {
    closeMenu,
    user,
    auth,
  };

  const client = mockClient;

  return (
    <AppContext.Provider value={ctx}>
      <Router>
        <ApolloProvider client={client}>
          <ApolloProviderHooks client={client}>
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
          </ApolloProviderHooks>
        </ApolloProvider>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
