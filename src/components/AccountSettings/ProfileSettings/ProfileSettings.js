import React, { useState, useEffect, useContext } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import AppContext from '../../../AppContext';
import TraderImg from '../../TraderImg/TraderImg';
import useTraderInfo from '../../../hooks/useTraderInfo';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const app = useContext(AppContext);

  // eslint-disable-next-line no-unused-vars
  const [info, loading, error] = useTraderInfo(app.trader, ['bio']);

  const [bio, setBio] = useState('');
  useEffect(() => {
    setBio(info.bio);
  }, [info.bio]);

  const [
    updateUser,
    updatingLoading,
    updateError,
  ] = useUpdateUser(app.trader, { bio });

  // const [
  //   uploadProfilePhoto,
  //   profilePhotoProgress,
  //   profilePhotoError,
  // ] = useUploadFile(app.trader, 'profilePhoto');

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
          {error && (<Alert variant="danger">{error.message}</Alert>)}
          {updateError && (
            <Alert dismissible className="save-error" variant="danger">{updateError}</Alert>
          )}

          <Form onSubmit={updateUser}>
            <Form.Group className="bio" controlId="formBio">
              <Form.Label>Edit Bio</Form.Label>
              <Form.Text className="text-muted">
                What do you want people to know about you?
              </Form.Text>
              <Form.Control
                as="textarea"
                name="bio"
                required
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </Form.Group>
          </Form>

          <Form.Group className="profilePhoto">
            <Form.Label>Edit Profile Photo</Form.Label>
            <div className="profilePhoto-inner">
              <TraderImg trader={app.trader} size="thumbnail" className="profilePhotoImg" />
              <Upload
                trader={app.trader}
                uploadKey="profilePhoto"
                render={(upload, progress, uploadError) => (
                  <div className="file-upload-wrap">
                    {progress === false && (
                      <div>
                        <input
                          type="file"
                          className="file-upload"
                          id="profileUploadInput"
                          name="profileUploadInput"
                          accept="image/png, image/jpeg"
                          onChange={upload}
                        />
                        <label className="btn btn-primary" htmlFor="profileUploadInput">Upload File</label>
                      </div>
                    )}

                    {progress !== false && progress >= 0 && (
                      <div>
                        {`${Math.trunc(progress)}%`}
                        <div
                          className="progressBar"
                          style={{
                            width: `${Math.trunc(progress)}%`,
                            height: '1px',
                            background: '#2fb1ff',
                          }}
                        />
                      </div>
                    )}

                    {uploadError && (
                      <Alert dismissible className="upload-profile-photo-error" variant="danger">
                        {uploadError}
                      </Alert>
                    )}
                  </div>
                )}
              />
            </div>
          </Form.Group>
        </Card.Body>
      </Card>
    </div>
  );
};

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


function Upload({ trader, uploadKey, render }) {
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
      await trader.upload({ key: uploadKey, file }, progressHandler);
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(false);
    }
  };

  return render(upload, progress, error);
}

export default ProfileSettings;
