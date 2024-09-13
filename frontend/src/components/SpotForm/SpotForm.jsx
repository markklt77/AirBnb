import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as spotActions from "../../store/spots";
import { useNavigate } from 'react-router-dom';
import './SpotForm.css';

function SpotForm({ initialData = {}, onSubmit, submitButtonText }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        address: "",
        city: "",
        state: "",
        country: "",
        lat: "",
        lng: "",
        name: "",
        description: "",
        price: "",
        image1: "",
        image2: "",
        image3: "",
        image4: "",
        image5: ""
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData({
            address: initialData.address || "",
            city: initialData.city || "",
            state: initialData.state || "",
            country: initialData.country || "",
            lat: initialData.lat || "",
            lng: initialData.lng || "",
            name: initialData.name || "",
            description: initialData.description || "",
            price: initialData.price || "",
            image1: initialData.images ? initialData.images[0] || "" : "",
            image2: initialData.images ? initialData.images[1] || "" : "",
            image3: initialData.images ? initialData.images[2] || "" : "",
            image4: initialData.images ? initialData.images[3] || "" : "",
            image5: initialData.images ? initialData.images[4] || "" : ""
        });
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const validationErrors = {};

        // Client-side validation for required fields
        if (!formData.country.trim()) validationErrors.country = "Country is required";
        if (!formData.address.trim()) validationErrors.address = "Address is required";
        if (!formData.city.trim()) validationErrors.city = "City is required";
        if (!formData.state.trim()) validationErrors.state = "State is required";
        if (!formData.lat.trim() || isNaN(formData.lat)) validationErrors.lat = "Latitude is required and must be a number";
        if (!formData.lng.trim() || isNaN(formData.lng)) validationErrors.lng = "Longitude is required and must be a number";
        if (!formData.description.trim() || formData.description.length < 30) validationErrors.description = "Description must be at least 30 characters";
        if (!formData.name.trim()) validationErrors.name = "Name is required";
        if (!formData.price.trim() || isNaN(formData.price)) validationErrors.price = "Price is required and must be a number";
        if (!formData.image1.trim()) validationErrors.image1 = "Preview image is required";

        // Image URL validation
        const imageFields = [formData.image1, formData.image2, formData.image3, formData.image4, formData.image5];
        imageFields.forEach((imageUrl, index) => {
            if (imageUrl && !imageUrl.match(/\.(png|jpg|jpeg)$/)) {
                validationErrors[`image${index + 1}`] = "Image URL must end in .png, .jpg, or .jpeg";
            }
        });

        // If there are validation errors, set them and stop submission
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const formattedFormData = {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price)
        };

        try {
            // Call the onSubmit function passed as a prop
            const result = await onSubmit(formattedFormData);

            // If there's a spot ID, handle image uploads
            if (result && result.id) {
                const imageObjects = [
                    { url: formData.image1, preview: true },
                    { url: formData.image2, preview: false },
                    { url: formData.image3, preview: false },
                    { url: formData.image4, preview: false },
                    { url: formData.image5, preview: false }
                ].filter(image => image.url);

                await dispatch(spotActions.uploadSpotImages(result.id, imageObjects));
                navigate(`/spots/${result.id}`);
            }

        } catch (res) {
            const data = await res.json();
            if (data && data.errors) {
                setErrors(data.errors);
            }
        }
    };

    return (
        <div className='creat-spot-form-container'>

            <div className='header-div'>
                <h1>{submitButtonText}</h1>
                <h2>Where&apos;s your place located?</h2>
                <p>Guests will only get your exact address once they booked a reservation</p>
            </div>

            <form onSubmit={handleSubmit}>
               {errors.country && (
                    <p className='error'>{errors.country}</p>
               )}
              <label>
                Country
                <div className='country-div'>
                    <input
                        type="text"
                        name="country"
                        placeholder='Country'
                        value={formData.country}
                        onChange={handleChange}
                    />
                </div>

              </label>
              {errors.address && (
                <p className='error'>{errors.address}</p>
              )}
              <label>
                Street Address
                <div className='street-address-div'>
                    <input
                        type="text"
                        name="address"
                        placeholder='Address'
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>
              </label>

              <div className='city-state-div'>

                <label className='city-div-label'>
                {errors.city && (
                    <p className='error'>{errors.city}</p>
                )}
                    City
                    <div className='city-div'>
                        <input
                            type="text"
                            name="city"
                            placeholder='City'
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </div>

                </label>

                <label className='state-div-label'>
                {errors.state && (
                    <p className='error'>{errors.state}</p>
                )}
                    State
                    <div className='state-div'>
                        <input
                            type="text"
                            name="state"
                            placeholder='STATE'
                            value={formData.state}
                            onChange={handleChange}
                        />
                    </div>

                </label>

              </div>
              <div className='latitude-longitude-div'>
                <label className='lat-div-label'>
                    Latitude
                    <div>
                        <input
                            type="text"
                            name="lat"
                            placeholder='Latitude'
                            value={formData.lat}
                            onChange={handleChange}
                        />
                    </div>

                </label>
                {errors.lat && (
                    <p className='error'>{errors.lat}</p>
                )}
                <label className='lng-div-label'>
                    Longitude
                    <div>
                        <input
                            type="text"
                            name="lng"
                            placeholder='Longitude'
                            value={formData.lng}
                            onChange={handleChange}
                        />
                    </div>

                </label>
                {errors.lng && (
                    <p className='error'>{errors.lng}</p>
                )}
              </div>
              <div>
                <h2>Describe your place to guests</h2>
                <label className='description-label'>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.
                    <div className='description-div'>
                        <textarea
                            type="text"
                            name="description"
                            placeholder='Please write at least 30 characters'
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                </label>
                {errors.description && (
                <p className='error'>{errors.description}</p>
                )}
              </div>
              <div>
                <h2>Create a title for your spot</h2>
                <label className='title-label'>Catch guest&apos;s attention with a spot title that highlights what makes your place special.
                    <div className='title-div'>
                        <input
                            type="text"
                            name="name"
                            placeholder='Name of your spot'
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                </label>
                {errors.name && (
                <p className='error'>{errors.name}</p>
                )}
              </div>
              <div>
                <h2>Set a base price for your spot</h2>
                <label className='price-label'>Competitive pricing can help your listing stand out and rank higher in search results.
                    <div className='price-div'>
                        <input
                            type="text"
                            name="price"
                            placeholder='Price per night (USD)'
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>

                </label>
                {errors.price && (
                <p className='error'>{errors.price}</p>
                )}
              </div>

              <div>
                <h2>Liven up your spot with photos</h2>
                <label className='image-inputs'>
                    Submit a link at least one photo to publish your spot.
                    <input
                        type="text"
                        name="image1"
                        placeholder='Preview Image URL'
                        value={formData.image1}
                        onChange={handleChange}
                    />
                    {errors.image1 && (
                    <p className='error'>{errors.image1}</p>
                    )}
                    <input
                        type="text"
                        name="image2"
                        placeholder='Image URL'
                        value={formData.image2}
                        onChange={handleChange}
                    />
                    {errors.image2 && (
                    <p className='error'>{errors.image2}</p>
                    )}
                    <input
                        type="text"
                        name="image3"
                        placeholder='Image URL'
                        value={formData.image3}
                        onChange={handleChange}
                    />
                    {errors.image3 && (
                    <p className='error'>{errors.image3}</p>
                    )}
                    <input
                        type="text"
                        name="image4"
                        placeholder='Image URL'
                        value={formData.image4}
                        onChange={handleChange}
                    />
                    {errors.image4 && (
                    <p className='error'>{errors.image4}</p>
                    )}
                    <input
                        type="text"
                        name="image5"
                        placeholder='Image URL'
                        value={formData.image5}
                        onChange={handleChange}
                    />
                    {errors.image5 && (
                    <p className='error'>{errors.image5}</p>
                    )}
                </label>
              </div>
              <div className='button-div'>
                <button type="submit" className='submit-button'>{submitButtonText}</button>
              </div>



            </form>
        </div>
    );
}

export default SpotForm;
