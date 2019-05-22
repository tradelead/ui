import React, { useState, useContext, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Card from 'react-bootstrap/Card';
import { FaTrashAlt } from 'react-icons/fa';
import useTraderInfo from '../../../hooks/useTraderInfo';
import AppContext from '../../../AppContext';
import './ExchangeKeys.css';

const ExchangeKeys = () => {
  const app = useContext(AppContext);

  const [showModal, setShowModal] = useState(false);
  const [addKeyError, setAddKeyError] = useState('');
  const [addingKey, setAddingKey] = useState(false);
  const [exchangeID, setExchangeID] = useState('binance');
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');

  // eslint-disable-next-line no-unused-vars
  const [info, loading, error] = useTraderInfo(app.trader, ['exchangeKeys']);
  console.log({ info, loading, error });

  const [exchangeKeys, setExchangeKeys] = useState([]);
  useEffect(() => {
    setExchangeKeys(info.exchangeKeys);
  }, [info]);

  const addExchangeKey = async (e) => {
    e.preventDefault();

    if (addingKey) {
      return;
    }
    setAddingKey(true);
    try {
      await app.trader.addExchangeKey({ exchangeID, token, secret });
      setShowModal(false);
    } catch (err) {
      setAddKeyError(err.message);
    }

    setAddingKey(false);
  };

  const updateExchangeKeyState = (curExchangeID, updateData) => {
    setExchangeKeys((keys) => {
      const keysDup = keys.slice(0);
      const curIndex = keys.findIndex(key => key.exchangeID === curExchangeID);
      keysDup[curIndex] = Object.assign({}, keysDup[curIndex], updateData);
      return keysDup;
    });
  };

  const deleteExchangeKey = (deleteKey) => {
    (async () => {
      updateExchangeKeyState(deleteKey.exchangeID, { deleting: true });

      try {
        await app.trader.deleteExchangeKey({ exchangeID: deleteKey.exchangeID });
      } catch (e) {
        updateExchangeKeyState(deleteKey.exchangeID, {
          deletingError: e.message,
          deleting: false,
        });
      }
    })();
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
            {error && (
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
                <button
                  aria-label={`Delete ${key.exchangeLabel}`}
                  type="button"
                  className={`delete ${(key.deleting) ? 'deleting' : ''}`}
                  onClick={() => deleteExchangeKey(key)}
                >
                  {!key.deleting && (<FaTrashAlt />)}
                  {key.deleting && (
                    <>
                      <Spinner
                        className="delete-loading"
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Loading...</span>
                    </>
                  )}
                </button>

                {key.deletingError && (
                  <Alert dismissible className="error" variant="danger">
                    Error Deleting:
                    {key.deletingError}
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <p className="message">
        Your exchange keys are stored encrypted using the Advanced Encryption Standard (AES)
        algorithm in Galois/Counter Mode (GCM) with 256-bit secret keys. We still recommend you use
        read only exchange API keys. Please consult your exchange for instructions on creating read
        only API keys.
      </p>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        dialogClassName="modal-90w exchange-key-modal"
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
                onChange={(e) => { setExchangeID(e.target.value); }}
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

export default ExchangeKeys;
