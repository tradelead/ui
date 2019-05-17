import React, { useState, useEffect, useContext } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import ProgressBar from 'react-bootstrap/ProgressBar';
import AppContext from '../../../AppContext';
import TraderImg from '../../TraderImg/TraderImg';

const ProfileSettings = () => {
  const app = useContext(AppContext);

  const [bio, setBio] = useState('');

  const fetchError = useTraderInfo(app.trader, ['bio'], { bio: setBio });

  const [
    updateUser,
    updatingLoading,
    updateError,
  ] = useUpdateUser(app.trader, { bio });

  const [
    uploadProfilePhoto,
    profilePhotoProgress,
    profilePhotoError,
  ] = useUploadFile(app.trader, 'profilePhoto');

  return (
    <div className="profileSettings">
      <Card>
        <Card.Header>
          <h2>Profile Settings</h2>
          <Button className="save" variant="primary" onClick={updateUser}>
            Save
            {updatingLoading && (
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
          </Button>
        </Card.Header>
        <Card.Body>
          {fetchError && (<Alert variant="danger">{fetchError}</Alert>)}
          {updateError && (
            <Alert dismissible className="save-error" variant="danger">{updateError}</Alert>
          )}

          <Form onSubmit={updateUser}>
            <Form.Group className="bio" controlId="formBio">
              <Form.Label>Bio</Form.Label>
              <Form.Text className="text-muted">
                What do you want people to know about you?
              </Form.Text>
              <Form.Control
                as="textarea"
                name="bio"
                required
                defaultValue={bio}
                onChange={e => setBio(e.target.value)}
              />
            </Form.Group>
          </Form>

          <div className="profilePhoto">
            <TraderImg trader={app.trader} size="thumbnail" className="profilePhotoImg" />
            <div className="file-upload-wrap">
              {profilePhotoProgress === false && (
                <div>
                  <input
                    type="file"
                    className="file-upload"
                    id="profileUploadInput"
                    name="profileUploadInput"
                    accept="image/png, image/jpeg"
                    onChange={uploadProfilePhoto}
                  />
                  <label htmlFor="profileUploadInput">Upload File</label>
                </div>
              )}

              {profilePhotoProgress !== false && profilePhotoProgress >= 0 && (
                <div>
                  <ProgressBar now={profilePhotoProgress} />
                </div>
              )}

              {profilePhotoError && (
                <Alert dismissible className="upload-profile-photo-error" variant="danger">
                  {profilePhotoError}
                </Alert>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

function useTraderInfo(trader, args, setters) {
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const info = await trader.get(args, false);
        Object.keys(info).forEach((key) => {
          if (setters[key]) {
            setters[key](info[key]);
          }
        });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [trader.id]);

  return error;
}

function useUpdateUser(trader, data) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateUser = async () => {
    if (!loading) {
      setLoading(true);
      try {
        await trader.update(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return [updateUser, loading, error];
}

function useUploadFile(trader, key) {
  const [progress, setProgress] = useState(false);
  const [error, setError] = useState('');

  const upload = async (e) => {
    if (progress !== false) {
      return;
    }

    setProgress(0);

    const file = e.target.files[0];

    const progressHandler = (n) => {
      setProgress(n);
    };

    try {
      await trader.upload({ key, file }, progressHandler);
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(false);
    }
  };

  return [upload, progress, error];
}

export default ProfileSettings;
