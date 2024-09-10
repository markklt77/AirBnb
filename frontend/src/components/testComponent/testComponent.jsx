
import { useDispatch } from 'react-redux';
import * as spotActions from "../../store/spots"

function TestComponent() {
    const dispatch = useDispatch();

    const handleTest = async () => {
        const spotId = 19;
        const imageObjects = [
            { url: 'http://example.com/image1.png', preview: true },
            { url: 'http://example.com/image2.png', preview: false },
            { url: 'http://example.com/image2.png', preview: false },
            { url: 'http://example.com/image2.png', preview: false },
            { url: 'http://example.com/image2.png', preview: false },
        ];

        try {
            await dispatch(spotActions.uploadSpotImages(spotId, imageObjects));
            console.log('Images uploaded successfully');
        } catch (error) {
            console.error('Error uploading images:', error);
        }
    };

    return <button onClick={handleTest}>Test Upload</button>;
}

export default TestComponent;
