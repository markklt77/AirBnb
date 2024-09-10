import { useState } from "react"
import { useDispatch } from "react-redux";
import { useModal } from '../../context/Modal';
import * as reviewActions from "../../store/reviews"



function PostReviewFormModal({ currentSpot }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();


    const [review, setReview] = useState("");
    const [stars, setStars] = useState(0);
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



            closeModal();
        } catch(error) {
            setErrors([error.message]);
        }


    }

    return (
        <>
            <h1>How was your stay?</h1>
            <form onSubmit={handleSubmit}>
                {errors.length > 0 && (
                    <ul>
                        {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                    </ul>
                )}
                <textarea
                    placeholder="Leave your review here..."
                    type="text"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />
                 <div>
                    <label>Rating: </label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={stars || ""}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setStars(isNaN(value) ? "" : value);
                        }}
                    />
                </div>
                <button type="submit" disabled={review.length < 10 || stars === 0}>Submit Your Review</button>
            </form>
        </>
    )
}

export default PostReviewFormModal
