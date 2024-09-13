
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
    const currentUser = useSelector(state => state.session.user);


    const hasUserReview = reviews.some(review => review.userId === currentUser?.id);

    const isSpotOwner = spot?.Owner?.id === currentUser?.id;




    useEffect(() => {
        dispatch(reviewActions.fetchReviewsById(spotId))
        dispatch(spotActions.fetchSpot(spotId));
    }, [dispatch, spotId]);

    if (!spot) {
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
                    <img src={'https://cdn.pixabay.com/photo/2023/12/17/09/47/door-8453898_1280.jpg'} alt={spot.name} className="spot-image5" />
                </div>

                <div className='image-grid'>
                    <img src={'https://cdn.pixabay.com/photo/2023/12/17/09/47/door-8453898_1280.jpg'} alt={spot.name} className="spot-image1" />
                    <img src={'https://cdn.pixabay.com/photo/2023/12/17/09/47/door-8453898_1280.jpg'} alt={spot.name} className="spot-image2" />
                    <img src={'https://cdn.pixabay.com/photo/2023/12/17/09/47/door-8453898_1280.jpg'} alt={spot.name} className="spot-image3" />
                    <img src={'https://cdn.pixabay.com/photo/2023/12/17/09/47/door-8453898_1280.jpg'} alt={spot.name} className="spot-image4" />
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
                        <p className='star'>⭐{spot.avgStarRating ? spot.avgStarRating.toFixed(1) : "0.0"}</p>
                        <p className='revy'>{reviews.length === 0 ? "NEW" : reviewCountText}</p>
                    </div>
                    <div className='bottom'>
                       <button className='reserve' onClick={reserveButton}>Reserve</button>
                    </div>
                </div>
            </div>
            <div className='reviews'>
                <div className='review-header'>
                    <p className='review-star'> ⭐{spot.avgStarRating ? spot.avgStarRating.toFixed(1) : "0.0"}</p>
                    <p >{reviews.length === 0 ? "NEW" : reviewCountText}</p>
                </div>

                {!hasUserReview && !isSpotOwner && currentUser && (
                        <OpenReviewModal
                            modalComponent={<PostReviewFormModal currentSpot={spotId} onModalClose={onReviewFormSubmitModalClose}/>}
                            itemText="Post Your Review"
                        />
                )}

                <div className='review-content'>
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} className='individual-review'>
                                <h3>{review.User?.firstName}</h3>
                                <div className='date'>{review.createdAt}</div>
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
                        isSpotOwner ? "" : "Be the first to post a review!"
                    )}
                </div>
            </div>
        </div>
        </div>
    )
}

export default SpotDetailsPage;
