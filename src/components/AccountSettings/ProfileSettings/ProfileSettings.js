import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import TraderImg from '../../TraderImg/TraderImg';
import './ProfileSettings.css';

const ProfileSettings = ({
  profile,
  update,
  updateRes,
  uploadProfilePhoto,
}) => {
  const info = profile.data;
  const { errors } = profile;

  const [bio, setBio] = useState('');
  useEffect(() => {
    setBio(info.bio);
  }, [info.bio]);

  const [website, setWebsite] = useState('');
  useEffect(() => {
    setWebsite(info.website);
  }, [info.website]);

  const updateUser = () => update({ bio, website });

  return (
    <div className="profileSettings">
      <Card>
        <Card.Header>
          <h2>Profile Settings</h2>
          <Button className="save" variant="primary" onClick={updateUser}>
            Save
            {updateRes.loading && (
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
          {errors && errors.map(error => (<Alert key={error.message} variant="danger">{error.message}</Alert>))}
          {updateRes.errors && updateRes.errors.map(error => (
            <Alert key={error.message} dismissible className="save-error" variant="danger">{error.message}</Alert>
          ))}

          <Form onSubmit={updateUser}>
            <Form.Group className="bio" controlId="formBio">
              <Form.Label>Edit Bio</Form.Label>
              <Form.Text className="text-muted">
                What do you want people to know about you?
              </Form.Text>
              <Form.Control
                as="textarea"
                name="bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="website" controlId="formWebsite">
              <Form.Label>Edit Website</Form.Label>
              <Form.Control
                name="website"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </Form.Group>
          </Form>

          <Form.Group className="profilePhoto">
            <Form.Label>Edit Profile Photo</Form.Label>
            <div className="profilePhoto-inner">
              <TraderImg
                src={info.profilePhoto && info.profilePhoto.url}
                alt={info.username}
                className="profilePhotoImg"
              />
              <Upload
                upload={uploadProfilePhoto}
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

ProfileSettings.propTypes = {
  profile: PropTypes.shape({
    data: PropTypes.shape({
      username: PropTypes.string,
      bio: PropTypes.string,
      website: PropTypes.string,
      profilePhoto: PropTypes.shape({
        url: PropTypes.string,
      }),
    }).isRequired,
    loading: PropTypes.bool.isRequired,
    errors: PropTypes.arrayOf(PropTypes.shape({
      message: PropTypes.string,
    })),
  }).isRequired,
  update: PropTypes.func.isRequired,
  updateRes: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    errors: PropTypes.arrayOf(PropTypes.shape({
      message: PropTypes.string,
    })),
  }).isRequired,
  uploadProfilePhoto: PropTypes.func.isRequired,
};

function Upload({ upload, render }) {
  const [progress, setProgress] = useState(false);
  const [error, setError] = useState('');

  const uploadWrap = async (e) => {
    if (progress !== false) {
      return;
    }

    setProgress(0);

    const file = e.target.files[0];

    try {
      await upload({ file, progressFn: n => setProgress(n) });
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(false);
    }
  };

  return render(uploadWrap, progress, error);
}

export default ProfileSettings;
