import SpotTile from "../SpotTile";
import * as spotActions from "../../store/spots"
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react";
import './SpotList.css';




const SpotList = ({ filter }) => {

  const dispatch = useDispatch();
  const { spots } = useSelector((state) => state.spots);


  useEffect(() => {
    dispatch(spotActions.fetchSpots());
  }, [dispatch]);


  const filteredSpots = filter ? spots.filter(filter) : spots;

    return (
      <div className="spot-list">
        {filteredSpots.map((spot) => (
          <SpotTile
            className='spot'
            key={spot.id}
            id={spot.id}
            image={spot.imageUrl}
            city={spot.city}
            state={spot.state}
            price={spot.price}
            rating={spot.avgRating}
            name={spot.name}
          />
        ))}
      </div>
    );
  };

  export default SpotList;
