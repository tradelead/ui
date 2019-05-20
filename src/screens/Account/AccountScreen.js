import React from 'react';
import Container from 'react-bootstrap/Container';
import AccountSetting from '../../components/AccountSettings/AccountSettings';
import './AccountScreen.css';

const AccountScreen = () => (
  <div className="account-screen">
    <Container>
      <h1>Account</h1>
      <AccountSetting />
    </Container>
  </div>
);

export default AccountScreen;
