import { useState } from "react"
import { useDispatch } from "react-redux";
import { useModal } from '../../context/Modal';
import * as reviewActions from "../../store/reviews"
import * as spotActions from "../../store/spots"
import { FaStar } from 'react-icons/fa';
import './PostReviewFormModal.css'



function PostReviewFormModal({ currentSpot }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();


    const [review, setReview] = useState("");
    const [stars, setStars] = useState(0);
    const [hoveredStars, setHoveredStars] = useState(0);
    const [errors, setErrors] = useState([]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = [];
        if (review.length < 10) validationErrors.push("Review must be at least 10 characters long.");
        if (stars <= 0 || stars > 5) validationErrors.push("Stars must be between 1 and 5.");


        if (validationErrors.length) {
            setErrors(validationErrors);
            return;
        }

        const reviewData = {
            review,
            stars
        };

        try {
            await dispatch(reviewActions.postReview(currentSpot, reviewData))
            await dispatch(spotActions.fetchSpot(currentSpot));


            closeModal();
        } catch(error) {
            setErrors([error.message]);
        }


    }

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            return (
                <span
                    key={starValue}
                    className={`star ${starValue <= (hoveredStars || stars) ? 'filled' : ''}`}
                    onClick={() => setStars(starValue)}
                    onMouseEnter={() => setHoveredStars(starValue)}
                    onMouseLeave={() => setHoveredStars(0)}
                >   <FaStar /> </span>
            );
        });
    };


    return (
        <div className="review-container">
            <h1>How was your stay?</h1>
            <form onSubmit={handleSubmit}>
                {errors.length > 0 && (
                    <ul>
                        {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                    </ul>
                )}
                <div className="text-div">
                    <textarea
                        placeholder="Leave your review here..."
                        type="text"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />
                </div>

                 <div className="stars-div">
                    {renderStars()}
                    <label>Stars</label>
                </div>
                <div className="review-button-div">
                    <button type="submit" disabled={review.length < 10 || stars === 0}>Submit Your Review</button>
                </div>

            </form>
        </div>
    )
}

export default PostReviewFormModal
