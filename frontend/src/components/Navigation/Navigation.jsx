// frontend/src/components/Navigation/Navigation.jsx

import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);


  return (
    <div className='navBar'>
      {sessionUser && (
        <NavLink to='/spots/new'>Create a New Spot</NavLink>
      )}
      <ul className='menu'>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        {isLoaded && (
          <li>
            <ProfileButton user={sessionUser} />
          </li>
        )}
      </ul>
    </div>

  );
}

export default Navigation;
