// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';
import * as sessionActions from './store/session';
import SpotList from './components/SpotList';
import SpotDetailsPage from './components/SpotDetailsPage';
import CreateSpotForm from './components/CreateSpotForm';
import UpdateSpotForm from './components/UpdateSpotForm/UpdateSpotForm';
import TestComponent from './components/testComponent';
import UserSpots from './components/UserSpots';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <SpotList/>
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetailsPage/>
      },
      {
        path: '/spots/new',
        element: <CreateSpotForm/>
      },
      {
        path: '/test',
        element: <TestComponent/>
      },
      {
        path: '/spots/current',
        element: <UserSpots/>
      },
      {
        path: '/spots/:spotId/edit',
        element: <UpdateSpotForm/>
      }

    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
