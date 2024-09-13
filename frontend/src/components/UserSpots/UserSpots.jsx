import SpotList from '../SpotList';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
// import { Link } from 'react-router-dom';
import * as spotActions from "../../store/spots";
import "./UserSpots.css"

const UserSpots = () => {
  const dispatch = useDispatch();
//   const { spots } = useSelector(state => state.spots);
  const currentUser = useSelector(state => state.session.user);

  //filter callback function used in spot list
  const userSpotsFilter = (spot) => spot.ownerId === currentUser?.id;

  useEffect(() => {
    dispatch(spotActions.fetchSpots());
  }, [dispatch]);


  return (
    <div className='manage-spots'>
        {/* <div className='header'>
          <h1>Manage Your Spots</h1>
          <Link to="/spots/new">
            <button className="create-spot-button">Create a New Spot</button>
          </Link>
        </div> */}



      <SpotList filter={userSpotsFilter} />


    </div>
  );
};

export default UserSpots;
