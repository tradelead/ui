import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { ExchangeKeysContainer as ExchangeKeys } from './ExchangeKeys/ExchangeKeysContainer';
import { ProfileSettingsContainer as ProfileSettings } from './ProfileSettings/ProfileSettingsContainer';

const AccountSettings = () => (
  <div className="account-settings">
    <Row>
      <Col md={6}>
        <ExchangeKeys />
      </Col>
      <Col md={6}>
        <ProfileSettings />
      </Col>
    </Row>
  </div>
);

export default AccountSettings;
