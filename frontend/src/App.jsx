// frontend/src/App.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Navigation from "./components/Navigation/Navigation";
import * as sessionActions from "./store/session";

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const sessionUser = useSelector((state) => state.session.user); // Get session user from Redux store

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      {/* Render Navigation bar on all pages */}
      <Navigation isLoaded={isLoaded} />

      {/* Render conditional header based on sessionUser */}
      <header>
        <h1>
          {sessionUser ? `Welcome, ${sessionUser.firstName}!` : "Welcome!"}
        </h1>
      </header>

      {/* Conditionally render Outlet only after user restoration */}
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [{ path: "/", element: null }],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
