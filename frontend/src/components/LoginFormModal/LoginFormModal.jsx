import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import useModal from '../../context/useModal';
import styles from './LoginFormModal.module.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  // Demo user credentials
  const demoUser = {
    credential: 'Demo-lition',
    password: 'password'
  };

  // Check if the form inputs are valid for enabling the button
  const isDisabled = credential.length < 4 || password.length < 6;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    return dispatch(sessionActions.login({ credential, password }))
      .then(() => closeModal())
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          // Customize error message based on the error type
          if (data.errors.credential) {
            setErrors({ credential: 'The provided credentials were invalid.' });
          } else if (data.errors.username) {
            setErrors({ credential: 'The username is incorrect.' });
          } else if (data.errors.password) {
            setErrors({ credential: 'The password is incorrect.' });
          }
        } else {
          setErrors({ credential: 'The provided credentials were invalid.' });
        }
      });
  };

  const handleDemoLogin = () => {
    dispatch(sessionActions.login(demoUser))
      .then(() => closeModal())
      .catch((err) => console.error("Demo login failed", err));
  };

  // Close modal when clicking outside of it
  const handleClickOutside = (e) => {
    if (e.target.classList.contains(styles.modalBackground)) {
      closeModal();
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1>Log In</h1>
          {errors.credential && (  // Display error message when invalid credentials
            <p className={styles.errorMessage}>{errors.credential}</p>
          )}
          <label className={styles.label}>
            Username or Email
            <input
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </label>

          <div className={styles.loginButtonContainer}>
          <button
            type="submit"
            className={`${styles.button} ${styles.loginButton}`}
            disabled={isDisabled}  // Disable button if conditions are not met
          >
            Log In
          </button>
          </div>

          <div className={styles.loginButtonContainer}>
          <button
            type="button"
            className={`${styles.button} ${styles.demoButton}`}
            onClick={handleDemoLogin}
          >
            Log In as Demo User
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginFormModal;
