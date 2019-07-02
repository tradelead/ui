import React from 'react';
import Container from 'react-bootstrap/Container';
import { Redirect } from 'react-router-dom';
import AccountSetting from '../../components/AccountSettings/AccountSettings';
import './AccountScreen.css';
import useNoUserRedirect from '../../hooks/useNoUserRedirect';

const AccountScreen = () => {
  const redirect = useNoUserRedirect();
  if (redirect) {
    return <Redirect to="/leaders" />;
  }

  return (
    <div className="account-screen">
      <Container>
        <h1>Account</h1>
        <AccountSetting />
      </Container>
    </div>
  );
};

export default AccountScreen;
