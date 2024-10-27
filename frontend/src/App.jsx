import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import * as sessionActions from './store/session';
import Navigation from './components/Navigation/Navigation';
import SpotList from './components/SpotList/SpotList';
import CreateSpotForm from './components/CreateSpotForm/CreateSpotForm';
import SpotDetail from './components/SpotDetail/SpotDetail';
import ManageSpotsPage from './components/ManageSpotsPage/ManageSpotsPage';
import LandingPage from './components/LandingPage/LandingPage';

import './components/Styles/Global.css';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  // const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      <header>
        {/* <h1>{sessionUser ? `Welcome, ${greetingName}!` : "Welcome!"}</h1> */}
      </header>
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <LandingPage /> },  // Landing page
      { path: '/spots', element: <SpotList /> },  // All spots
      { path: '/create-spot', element: <CreateSpotForm /> },  // Create new spot
      { path: '/spots/:spotId', element: <SpotDetail /> },  // Spot details
      { path: '/manage-spots', element: <ManageSpotsPage /> },  // Manage spots
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
