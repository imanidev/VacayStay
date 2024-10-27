import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import SignupFormModal from '../SignupFormModal/SignupFormModal';
import styles from './ProfileButton.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation();
    const menuElement = document.querySelector(`.${styles.menuContainer}`);

    if (showMenu) {
      menuElement.classList.remove(styles.active);
    } else {
      menuElement.classList.add(styles.active);
    }

    setShowMenu(!showMenu);
  };

  // Ensure the active class is removed when the menu closes
  useEffect(() => {
    if (!showMenu) {
      const menuElement = document.querySelector(`.${styles.menuContainer}`);
      menuElement.classList.remove(styles.active);
      return;
    }

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
        const menuElement = document.querySelector(`.${styles.menuContainer}`);
        menuElement.classList.remove(styles.active); // Remove active class
      }
    };

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    navigate('/');
  };

  const handleManageSpots = () => {
    closeMenu();
    navigate('/manage-spots');
  };

  return (
    <div className={styles.profileButtonContainer}>
      <button onClick={toggleMenu}>
        <div className={styles.menuContainer}>
          <FontAwesomeIcon icon={faBars} className={styles.barsIcon} />
          <FontAwesomeIcon icon={faUser} className={styles.faIcon} />
        </div>
      </button>

      <ul className={`${styles.profileDropdown} ${showMenu ? '' : styles.hidden}`} ref={ulRef}>
        {user ? (
          <>
            <li className={styles.userInfo}>
              <div className={styles.userText}>
                <span className={styles.helloText}>Hello </span>
                <span className={styles.userName}> {user.firstName}!</span>
                <span>{user.email}</span>
              </div>
            </li>

            <li onClick={handleManageSpots}>
              <div className={styles.menuItem}>
                <FontAwesomeIcon icon={faHome} style={{ fontSize: '14px', marginRight: '8px' }} />
                <button className={`${styles.actionLink} ${styles.uppercase}`}>Manage Spots</button>
              </div>
            </li>
            <li onClick={logout}>
              <div className={styles.menuItem}>
                <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: '14px', marginRight: '8px' }} />
                <button className={`${styles.actionLink} ${styles.uppercase}`}>Log Out</button>
              </div>
            </li>
          </>
        ) : (
          <>
            <OpenModalMenuItem
              itemText="Log In"
              onItemClick={closeMenu}
              modalComponent={<LoginFormModal />}
              className={styles.uppercase}
            />
            <OpenModalMenuItem
              itemText="Sign Up"
              onItemClick={closeMenu}
              modalComponent={<SignupFormModal />}
              className={styles.uppercase}
            />
          </>
        )}
      </ul>
    </div>
  );
}

export default ProfileButton;
