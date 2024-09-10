import SpotForm from '../SpotForm/SpotForm';
import { useDispatch, useSelector } from 'react-redux';
import * as spotActions from "../../store/spots";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function UpdateSpotForm() {
    const dispatch = useDispatch();
    const { spotId } = useParams();
    const spot = useSelector(state => state.spots.spots.find(spot => spot.id === parseInt(spotId)));
    const [initialData, setInitialData] = useState({});

    useEffect(() => {
        if (spot) {
            setInitialData({
                address: spot.address,
                city: spot.city,
                state: spot.state,
                country: spot.country,
                lat: String(spot.lat),
                lng: String(spot.lng),
                name: spot.name,
                description: spot.description,
                price: String(spot.price),
                images: spot.images
            });
        }
    }, [spot]);

    const handleUpdateSpot = async (spotData) => {
        const updatedSpot = await dispatch(spotActions.updateSpot(spotId, spotData));
        return updatedSpot;
    };

    return (
        <SpotForm
            initialData={initialData}
            onSubmit={handleUpdateSpot}
            submitButtonText="Update Your Spot"
        />
    );
}

export default UpdateSpotForm;
