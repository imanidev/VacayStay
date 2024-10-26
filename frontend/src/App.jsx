import Homepage from "./components/Homepage/Homepage.jsx";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Navigation from "./components/Navigation/Navigation";
import * as sessionActions from "./store/session";

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  // const sessionUser = useSelector((state) => state.session.user); // Get session user from Redux store

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      {/* Render Navigation bar on all pages */}
      <Navigation isLoaded={isLoaded} />

      {/* Render conditional header based on sessionUser */}
      {/* <header>
        <h1>
          {sessionUser ? `Welcome, ${sessionUser.firstName}!` : "Welcome!"}
        </h1>
      </header> */}

      {/* Conditionally render Outlet only after user restoration */}
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "spots",
        children: [
          {
            path: ":spotId",

            children: [
              {
                index: true,
                element: <h1>Spot Details Page</h1>,
              },
              {
                path: "edit",
                element: <h1>Edit Spot Page</h1>,
              },
            ],
          },
          {
            path: "new",
            element: <h1>New Spot Page</h1>,
          },
          {
            path: "current",
            element: <h1>Current Spots Page</h1>,
          },
        ],
      },
      {
        path: "reviews",
        children: [
          {
            path: ":reviewId",
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <h1>Page Not Found</h1>,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
