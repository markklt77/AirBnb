const express = require('express')
const { Op, fn, col } = require('sequelize');
const { Spot } = require('../../db/models')
const { Review } = require('../../db/models')
const { ReviewImage } = require('../../db/models')
const { SpotImage } = require('../../db/models')
const { User } = require('../../db/models')
const { sequelize } = require('../../db/models')
const { Booking } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');

const router = express.Router()


router.delete('/:imageId', requireAuth, async(req, res, next) => {
    try {
        const { imageId } = req.params;
        const userId = req.user.id;

        const reviewImage = await ReviewImage.findByPk(imageId);

        if (!reviewImage) {
            const error = new Error ("Review Image couldn't be found");
            error.status = 404;
            throw error;
        }

        const review = await Review.findByPk(reviewImage.reviewId);

        if (!review) {
            const error = new Error("Review couldn't be found");
            error.status = 404;
            throw error;
        }

        if (review.userId !== userId) {
            const error = new Error("Forbidden");
            error.status = 403;
            throw error;
        }

        await reviewImage.destroy();

        res.status(200).json({
            message: "Successfully deleted"
        });


    } catch (error) {
        next(error)
    }
})

module.exports = router;
