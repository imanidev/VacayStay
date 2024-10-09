// frontend/src/components/Navigation/ProfileButton.jsx

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { FaUserCircle, FaSignOutAlt, FaEnvelope } from "react-icons/fa";
import * as sessionActions from "../../store/session";
import OpenModalMenuItem from "./OpenModalMenuItem";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import "./ProfileButton.css";

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
  };

  return (
    <div className="profile-button-container">
      <button onClick={toggleMenu}>
        <FaUserCircle size={24} />
      </button>
      <ul
        className={`profile-dropdown ${showMenu ? "" : "hidden"}`}
        ref={ulRef}
      >
        {user ? (
          <>
            <li>
              <FaUserCircle style={{ marginRight: "8px" }} />
              {user.username}
            </li>
            <li>
              <FaUserCircle style={{ marginRight: "8px" }} />
              {user.firstName} {user.lastName}
            </li>
            <li>
              <FaEnvelope style={{ marginRight: "8px" }} />
              {user.email}
            </li>
            <li onClick={logout}>
              <FaSignOutAlt style={{ marginRight: "8px" }} />
              Log Out
            </li>
          </>
        ) : (
          <>
            <OpenModalMenuItem
              itemText="Log In"
              onItemClick={closeMenu}
              modalComponent={<LoginFormModal />}
            />
            <OpenModalMenuItem
              itemText="Sign Up"
              onItemClick={closeMenu}
              modalComponent={<SignupFormModal />}
            />
          </>
        )}
      </ul>
    </div>
  );
}

export default ProfileButton;
