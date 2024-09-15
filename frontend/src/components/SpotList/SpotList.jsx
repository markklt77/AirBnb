import SpotTile from "../SpotTile";
import * as spotActions from "../../store/spots"
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import './SpotList.css';




const SpotList = ({ filter }) => {

  const dispatch = useDispatch();
  const { spots } = useSelector((state) => state.spots);
  const location = useLocation();


  useEffect(() => {
    dispatch(spotActions.fetchSpots());
  }, [dispatch]);


  const filteredSpots = filter ? spots.filter(filter) : spots;




    return (
      <div className="spot-list-container">
          {location.pathname === '/spots/current' && (
            <div className='header'>
              <h1>Manage Spots</h1>
              {filteredSpots.length === 0 && (
                <Link to="/spots/new">
                  <button className="create-spot-button">Create a New Spot</button>
                </Link>
              )}
            </div>
          )}

        <div className="spot-list">
          {filteredSpots.map((spot) => (
            <SpotTile
              className='spot'
              key={spot.id}
              id={spot.id}
              image={spot.previewImage}
              city={spot.city}
              state={spot.state}
              price={spot.price.toFixed(2)}
              rating={spot.avgRating}
              name={spot.name}
            />
          ))}
        </div>
      </div>

    );
  };

  export default SpotList;
