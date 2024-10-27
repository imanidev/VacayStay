import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useModal from '../../context/useModal';
import * as sessionActions from '../../store/session';
import styles from './SignupFormModal.module.css';

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { closeModal } = useModal();

  useEffect(() => {

    if (
      !email ||
      !username || username.length < 4 ||
      !firstName || !lastName ||
      !password || password.length < 6 ||
      confirmPassword !== password
    ) {
      setIsButtonDisabled(true);
    } else {
      setIsButtonDisabled(false);
    }
  }, [email, username, firstName, lastName, password, confirmPassword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data?.errors) {
            setErrors(data.errors);
          }
        });
    }
    return setErrors({
      confirmPassword: "Confirm Password field must be the same as the Password field"
    });
  };

  // Handle closing modal on click outside
  const handleClickOutside = (e) => {
    if (e.target.classList.contains(styles.modalBackground)) {
      closeModal();
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <h1 className={styles.heading}>Sign Up</h1>
        <form onSubmit={handleSubmit} className={styles.signupForm}>
          <label className={styles.label}>
            First Name
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}

          <label className={styles.label}>
            Last Name
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}

          <label className={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          {errors.email && <p className={styles.error}>{errors.email}</p>}

          <label className={styles.label}>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          {errors.username && <p className={styles.error}>{errors.username}</p>}
          {username.length > 0 && username.length < 4 && (
            <p className={styles.error}>Username must be at least 4 characters long</p>
          )}

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
          {errors.password && <p className={styles.error}>{errors.password}</p>}
          {password.length > 0 && password.length < 6 && (
            <p className={styles.error}>Password must be at least 6 characters long</p>
          )}

          <label className={styles.label}>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          {errors.confirmPassword && (
            <p className={styles.error}>{errors.confirmPassword}</p>
          )}

          <div className={styles.loginButtonContainer}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isButtonDisabled}
          >
            Sign Up
          </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default SignupFormModal;
