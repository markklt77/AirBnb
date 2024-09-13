// frontend/src/components/LoginFormModal/LoginFormModal.jsx

import { useEffect, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal({ onSuccess }) {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();
  const [isDemoUser, setIsDemoUser] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(() => {
        closeModal();
        onSuccess();
      })
      .catch(async (res) => {
        const data = await res.json();
        if (data) {
          setErrors(data);
        }
      });
  };

  useEffect(() => {
    if (isDemoUser) {
      handleSubmit(new Event('submit'));
      setIsDemoUser(false);
    }
  }, [credential, password, isDemoUser]);

  const loginDemoUser = () => {
    setCredential('demo@user.io')
    setPassword('password')
    setIsDemoUser(true);
  }

  const isButtonDisabled = credential.length < 4 || password.length < 6;


  return (
    <div className='login-form-container'>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
          {errors.message && (
              <p className='error'>{errors.message}</p>
          )}
          <input
            className='credential-input'
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder='Username or Email'
            required
          />
          <input
            className='password-input'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
            required
          />

        <button type="submit" disabled={isButtonDisabled} className='log-in-button'>Log In</button>
        <button className="link-button" onClick={loginDemoUser}>Demo User</button>
      </form>

    </div>
  );
}

export default LoginFormModal;
