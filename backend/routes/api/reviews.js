const express = require('express')
const { Op, fn, col } = require('sequelize');
const { Spot } = require('../../db/models')
const { Review } = require('../../db/models')
const { ReviewImage } = require('../../db/models')
const { SpotImage } = require('../../db/models')
const { User } = require('../../db/models')
const { sequelize } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');
const { route } = require('./users');
const formatTimeStamps = require('../../utils/formatTimeStamps')

const router = express.Router();

router.get('/current', requireAuth, async (req, res, next) => {
    try {
        const reviews = await Review.findAll({
            where: {
                userId: req.user.id
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Spot,
                    attributes: [
                        'id', 'ownerId', 'address', 'city', 'state', 'country',
                        'lat', 'lng', 'name', 'price',
                        [sequelize.literal('(SELECT url FROM "SpotImages" WHERE "SpotImages".spotId = Spot.id AND "SpotImages".preview = true LIMIT 1)'), 'previewImage']
                    ]
                },
                {
                    model: ReviewImage,
                    attributes: ['id', 'url']
                }
            ]
        })

        res.status(200).json({ "Reviews": formatTimeStamps(reviews)})
    } catch (err) {
        next(err)
    }
})

//Create and return a new image for a review specified by id.
router.post('/:reviewId/images', requireAuth, async(req, res, next) => {
    const { reviewId } = req.params;
    const { url } = req.body;
    const userId = req.user.id;

    try {
        const review = await Review.findByPk(reviewId)


        if (!review) {
            const error = new Error("Review couldn't be found");
            error.status = 404;
            throw error;
        }

        if (review.userId !== userId) {
            const error = new Error("Forbidden")
            error.status = 403;
            throw error
        }

        const imageCount = await ReviewImage.count({
            where: { reviewId }
        })

        if (imageCount >= 10) {
            const error = new Error("Maximum number of images for this resource was reached");
            error.status = 403;
            throw error
        }

        const newImage = await ReviewImage.create({
            reviewId,
            url
        })

        res.status(201).json( {
            id: newImage.id,
            url: newImage.url
        })

    } catch (error) {
        next(error)
    }
})

//Update and return an existing review.

router.put('/:reviewId', requireAuth, async(req, res, next) => {
    try {
        const userId = req.user.id
        const reviewId = req.params.reviewId
        const { review, stars } = req.body

        const existingReview = await Review.findByPk(reviewId)

        if (!existingReview) {
            const error = new Error("Review couldn't be found")
            error.status = 404
            throw error
        }

        if (existingReview.userId !== userId) {
            const error = new Error("Forbidden")
            error.status = 403;
            throw error
        }

        existingReview.set({
            review,
            stars
        })

        await existingReview.validate();

        await existingReview.save();

        res.status(200).json(formatTimeStamps(existingReview));

    } catch(error) {
        next(error)
    }
})

router.delete('/:reviewId', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id
        const reviewId = req.params.reviewId

        const existingReview = await Review.findByPk(reviewId)

        if (!existingReview) {
            const error = new Error ("Review couldn't be found")
            error.status = 404
            throw error
        }

        if (existingReview.userId !== userId) {
            const error = new Error ("Forbidden")
            error.status = 403
            throw error
        }

        await existingReview.destroy()

        res.status(200).json({ "message": "Successfully deleted" })

    } catch (error) {
        next(error)
    }
})

module.exports = router
