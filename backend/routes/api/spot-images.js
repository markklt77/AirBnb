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

        const spotImage = await SpotImage.findByPk(imageId)

        if (!spotImage) {
            const error = new Error("Spot Image couldn't be found");
            error.status = 404;
            throw error;
        }

        const spot = await Spot.findByPk(spotImage.spotId);

        if (!spot) {
            const error = new Error("Spot couldn't be found");
            error.status = 404;
            throw error;
        }

        if (spot.ownerId !== userId) {
            const error = new Error("Forbidden");
            error.status = 403;
            throw error;
        }

        await spotImage.destroy();

        res.status(200).json({
            message: "Successfully deleted"
        });


    } catch (error) {
        next(error)
    }
})

module.exports = router;
