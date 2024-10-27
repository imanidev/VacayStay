import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';

import styles from './Navigation.module.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);

  return (
    <div className={styles.initialContainer}>
      <nav className={styles.navBarContainer}>
        <div className={styles.navBar}>
          <div className={styles.navLeft}>
          <NavLink to="/" className={`${styles.landingNav} ${styles.siteTitle}`}>Stay Scape</NavLink>
          </div>
          {isLoaded && (
            <div className={styles.navRight}>
              {sessionUser && (
                <NavLink to="/create-spot" className={`${styles.createStayButton}`}>
                 Create your spot
                </NavLink>
              )}
             <ProfileButton user={sessionUser} className={styles.profileButton} />
            </div>
          )}
        </div>
      </nav>
    </div>
  );

}

export default Navigation;
