import SpotForm from "../SpotForm/SpotForm";
import { useDispatch } from 'react-redux';
import * as spotActions from "../../store/spots";
import './CreateSpotForm.css';

function CreateSpotForm() {
    const dispatch = useDispatch();

    const handleCreateSpot = async (spotData) => {
        const newSpot = await dispatch(spotActions.createSpot(spotData));
        return newSpot;
    };

    return (
        <div className="creat-spot-form">
            <SpotForm
                initialData={{}}
                onSubmit={handleCreateSpot}
                submitButtonText="Create a New Spot"
            />
        </div>

    );
}

export default CreateSpotForm;
