// frontend/src/components/Navigation/Navigation.jsx

import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import airbnbLogo from "../../assets/airbnbLogo.png"
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);


  return (
    <div className='navBar'>
      <NavLink to="/" className="logo">
          <img src={airbnbLogo} alt="Airbnb Logo" className='airbnb-logo'/>
      </NavLink>
      <div className='right-side'>
        {sessionUser && (
          <NavLink to='/spots/new' className="nav-link">Create a New Spot</NavLink>
        )}

          {isLoaded && (
            <div className="menu" >
              <ProfileButton user={sessionUser} />
            </div>
          )}

      </div>
    </div>

  );
}

export default Navigation;
