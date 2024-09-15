
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import OpenReviewModal from '../PostReviewFormModal/OpenReviewModal';
import OpenModalButton from '../OpenModalButton';
import DeleteModal from '../DeleteModal/DeleteModal';
import PostReviewFormModal from '../PostReviewFormModal';
import * as spotActions from "../../store/spots"
import * as reviewActions from "../../store/reviews"
import './SpotDetailsPage.css';


function SpotDetailsPage () {

    async function onReviewFormSubmitModalClose() {
        await dispatch(reviewActions.fetchReviewsById(spotId));
        // await dispatch(spotActions.fetchSpot(spotId));
    }


    function reserveButton() {
            alert('Feature coming soon')
    }

    const dispatch = useDispatch();
    const { spotId } = useParams();

    const spot = useSelector(state => state.spots.spot);
    const reviews = useSelector(state => state.reviews.reviews)
    const sortedReviews = reviews.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const currentUser = useSelector(state => state.session.user);


    const hasUserReview = reviews.some(review => review.userId === currentUser?.id);

    const isSpotOwner = spot?.Owner?.id === currentUser?.id;




    useEffect(() => {
        dispatch(reviewActions.fetchReviewsById(spotId))
        dispatch(spotActions.fetchSpot(spotId));
    }, [dispatch, spotId]);

    if (!spot || !spot.SpotImages) {
        return <div>Loading...</div>;
    }


    const reviewCountText = reviews.length === 1 ? "1 review" : `${reviews.length} reviews`;


    const handleDeleteReview = async (reviewId) => {
        await dispatch(reviewActions.deleteReviewById(reviewId));
        await dispatch(reviewActions.fetchReviewsById(spotId));
        await dispatch(spotActions.fetchSpot(spotId))
    };



    return (
        <div className='larger-page'>
        <div className='page'>
            <div>
                <h1>{spot.name}</h1>
                <p>{spot.city}, {spot.state}, {spot.country}</p>
            </div>
            <div className='images'>
                <div className='large-image'>
                    {spot.SpotImages[0] && (
                        <img src={spot.SpotImages[0].url} alt={spot.name} className="spot-image5" />
                    )}
                </div>

                <div className='image-grid'>
                    {spot.SpotImages[1] && (
                        <img src={spot.SpotImages[1].url} alt={spot.name} className="spot-image1" />
                    )}
                    {spot.SpotImages[2] && (
                        <img src={spot.SpotImages[2].url} alt={spot.name} className="spot-image2" />
                    )}
                    {spot.SpotImages[3] && (
                        <img src={spot.SpotImages[3].url} alt={spot.name} className="spot-image3" />
                    )}
                    {spot.SpotImages[4] && (
                        <img src={spot.SpotImages[4].url} alt={spot.name} className="spot-image4" />
                    )}
                </div>
            </div>
            <div className='description'>
                <div className='words'>
                    <h2 className='owner'>Hosted by {`${spot.Owner?.firstName || "Anonymous"} ${spot.Owner?.lastName || ""}`}</h2>
                    <p className='des'>{spot.description}</p>
                </div>

                <div className='further-details'>
                    <div className='top'>
                        <p className='price'>${spot.price} night</p>
                        <p className='star'> ⭐{reviews.length === 0 ? "NEW" : spot.avgStarRating?.toFixed(1)}</p>
                        {reviews.length > 0 && (
                            <>
                                <p className='dot'>.</p>
                                <p className='revy'>{reviewCountText}</p>
                            </>
                        )}
                    </div>
                    <div className='bottom'>
                       <button className='reserve' onClick={reserveButton}>Reserve</button>
                    </div>
                </div>
            </div>
            <div className='reviews'>
                <div className='review-header'>
                    <p className='review-star'> ⭐{reviews.length === 0 ? "NEW" : spot.avgStarRating?.toFixed(1)}</p>
                    {reviews.length > 0 && (
                            <div className='dot-review-container'>
                                <p className='dot'>.</p>
                                <p className='revy'>{reviewCountText}</p>
                            </div>
                        )}
                </div>

                {!hasUserReview && !isSpotOwner && currentUser && (
                        <OpenReviewModal
                            modalComponent={<PostReviewFormModal currentSpot={spotId} onModalClose={onReviewFormSubmitModalClose}/>}
                            itemText="Post Your Review"
                        />
                )}

                <div className='review-content'>
                    {reviews.length > 0 ? (
                        sortedReviews.map(review => (
                            <div key={review.id} className='individual-review'>
                                <h3>{review.User?.firstName}</h3>
                                <div className='date'>
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                    })}
                                </div>
                                <div className='rev'>{review.review}</div>
                                {review.userId === currentUser?.id && (
                                    <OpenModalButton
                                        modalComponent={<DeleteModal entityId={review.id} entityType={"Review"} deleteAction={handleDeleteReview}/>}
                                        buttonText={'Delete'}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        currentUser && !isSpotOwner ? "Be the first to post a review!": ""
                    )}
                </div>
            </div>
        </div>
        </div>
    )
}

export default SpotDetailsPage;
