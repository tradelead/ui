import React, { useState, useContext, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Card from 'react-bootstrap/Card';
import AppContext from '../../../AppContext';

const ExchangeKeys = () => {
  const app = useContext(AppContext);
  const [exchangeKeys, setExchangeKeys] = useState([]);
  const [fetchKeysError, setFetchKeysError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [addKeyError, setAddKeyError] = useState('');
  const [addingKey, setAddingKey] = useState(false);
  const [exchangeID, setExchangeID] = useState('');
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');

  useTraderExchangeKeys({ trader: app.trader, setExchangeKeys, setFetchKeysError });

  const addExchangeKey = async () => {
    if (addingKey) {
      return;
    }
    setAddingKey(true);
    try {
      const exchangeKey = await app.trader.addExchangeKey({ exchangeID, token, secret });
      setExchangeKeys([...exchangeKeys, exchangeKey]);
      setShowModal(false);
    } catch (e) {
      setAddKeyError(e.message);
    }

    setAddingKey(false);
  };

  return (
    <div className="exchangeKey">
      <Card>
        <Card.Header>
          <h2>Exchange Keys</h2>
          <Button className="add-key" variant="primary" onClick={() => setShowModal(true)}>
            Add Key
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="exchange-keys">
            {fetchKeysError && (
              <Alert className="error" variant="danger">Error Fetching Keys</Alert>
            )}

            {exchangeKeys && exchangeKeys.length > 0 && exchangeKeys.map(key => (
              <div key={key.exchangeID} className="exchange-key">
                <div className="exchange">{key.exchangeLabel}</div>
                <div className="tokenLast4">
                  ****
                  {key.tokenLast4}
                </div>
                <div className="secretLast4">
                  ****
                  {key.secretLast4}
                </div>
              </div>
            ))}
          </div>
          <Button variant="primary">Go somewhere</Button>
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        dialogClassName="modal-90w"
        aria-labelledby="exchange-key-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="exchange-key-modal-title">
            Add Exchange Key
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={addExchangeKey}>
            <Form.Group controlId="formExchangeID">
              <Form.Label>Exchange</Form.Label>
              <Form.Control
                as="select"
                name="exchangeID"
                required
                onChange={e => setExchangeID(e.target.value)}
              >
                <option value="binance">Binance</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formToken">
              <Form.Label>Token</Form.Label>
              <Form.Control
                name="token"
                placeholder="read only token key"
                required
                onChange={e => setToken(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formSecret">
              <Form.Label>Secret</Form.Label>
              <Form.Control
                name="secret"
                placeholder="read only secret key"
                required
                onChange={e => setSecret(e.target.value)}
              />
            </Form.Group>

            <p>Remember! Use read only exchange keys.</p>

            {addKeyError.length > 0 ? (
              <Alert dismissible variant="danger">
                <Alert.Heading>Error Adding Key</Alert.Heading>
                <p>{addKeyError}</p>
              </Alert>
            ) : ''}

            <Button variant="primary" type="submit" disabled={addingKey}>
              Add
              {addingKey && (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Loading...</span>
                </>
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

function useTraderExchangeKeys({ trader, setExchangeKeys, setFetchKeysError }) {
  useEffect(() => {
    (async () => {
      try {
        const traderKeys = await trader.getExchangeKeys();
        setExchangeKeys(traderKeys);
      } catch (e) {
        setFetchKeysError(true);
      }
    })();
  }, [trader]);
}

export default ExchangeKeys;
