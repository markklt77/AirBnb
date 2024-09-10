import SpotForm from "../SpotForm/SpotForm";
import { useDispatch } from 'react-redux';
import * as spotActions from "../../store/spots";

function CreateSpotForm() {
    const dispatch = useDispatch();

    const handleCreateSpot = async (spotData) => {
        const newSpot = await dispatch(spotActions.createSpot(spotData));
        return newSpot;
    };

    return (
        <SpotForm
            initialData={{}}
            onSubmit={handleCreateSpot}
            submitButtonText="Create a New Spot"
        />
    );
}

export default CreateSpotForm;
