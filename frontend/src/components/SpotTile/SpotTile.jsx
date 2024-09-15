
import { useLocation } from 'react-router-dom';

import * as spotActions from '../../store/spots';
import DeleteSpotModal from '../DeleteModal/DeleteModal';
import './SpotTile.css';
import OpenModalButton from '../OpenModalButton'
import { Link } from 'react-router-dom';

const SpotTile = ({ id, image, city, state, price, rating, name }) => {

  const location = useLocation();


  const isUserSpotsPage = location.pathname === '/spots/current';

  // let testImage = "data:image/jpeg;base64,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"

  return (
    <div>
      <Link to={`/spots/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="spot-tile" data-tooltip={`${name}`} >
              <img src={image} alt={`${city} ${state}`} className="item item1" />
              <p className="item item2">{`${city}, ${state}`}</p>
              <p className="item item3">{`$${price} night`}</p>
              <p className="item item4">{`⭐ ${rating ? rating.toFixed(1) : "NEW"}`}</p>
          </div>
      </Link>
      {isUserSpotsPage && (
        <div className="spot-actions">
          <Link to={`/spots/${id}/edit`}>
            <button className='update-button'>Update</button>
          </Link>

          <OpenModalButton
            modalComponent={<DeleteSpotModal entityId={id} entityType={"Spot"} deleteAction={spotActions.deleteSpot}/>}
            buttonText="Delete"
            className="delete-button"
          />


        </div>
      )}
    </div>
  );
};

export default SpotTile;
