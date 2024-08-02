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

router.get('/current', requireAuth, async(req, res, next) => {
    try {
        const currentUser = req.user.id;

        const bookings = await Booking.findAll({
            where: {
                userId: currentUser
            },
            include: [
                {
                    model: Spot,
                    attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price', [
                        sequelize.literal(`(
                          SELECT url
                          FROM SpotImages
                          WHERE SpotImages.spotId = Spot.id
                          AND SpotImages.preview = true
                          LIMIT 1
                        )`),
                        'previewImage'
                    ]]
                }
            ]
    })

    res.status(200).json({ Bookings: bookings })
    } catch (error) {
        next(error)
    }
})

router.put('/:bookingId', requireAuth, async(req, res, next) => {
    try {
        const { bookingId } = req.params
        const userId = req.user.id
        const { startDate, endDate } = req.body;

        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            const error = new Error("Booking couldn't be found");
            error.status = 404;
            throw error;
        }

        if (booking.userId !== userId) {
            const error = new Error("Forbidden");
            error.status = 403;
            throw error;
        }

        const now = new Date();
        const bookingEndDate = new Date(booking.endDate);

        if (bookingEndDate < now) {
            const error = new Error("Past bookings can't be modified");
            error.status = 403;
            throw error;
        }

        const spotId = booking.spotId

        const conflictingBookings = await Booking.findAll({
            where: {
                spotId: spotId,
                [Op.or]: [
                    {
                        startDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        endDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        [Op.and]: [
                            { startDate: { [Op.lte]: startDate } },
                            { endDate: { [Op.gte]: endDate } }
                        ]
                    }
                ]
            }
        });

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        if (conflictingBookings.length) {
            const errors = {};
            conflictingBookings.forEach(booking => {

                const bookingStartDate = new Date(booking.startDate);
                const bookingEndDate = new Date(booking.endDate);

                if (bookingStartDate >= startDateObj && bookingStartDate <= endDateObj) {
                    errors.startDate = 'Start date conflicts with an existing booking';

                } else if (bookingEndDate >= startDateObj && bookingEndDate <= endDateObj) {
                    errors.endDate = 'End date conflicts with an existing booking';

                } else if (bookingStartDate <= startDateObj && bookingEndDate >= endDateObj) {
                    errors.startDate = 'Start date conflicts with an existing booking';
                    errors.endDate = 'End date conflicts with an existing booking';

                }
            });

            const error = new Error('Sorry, this spot is already booked for the specified dates');
            error.status = 403;
            error.errors = errors;
            throw error;
        }

        booking.set({
            startDate: startDate,
            endDate: endDate
        })
        await booking.save();

        res.status(200).json({
            id: booking.id,
            spotId: booking.spotId,
            userId: req.user.id,
            startDate: startDate,
            endDate: endDate,
            updatedAt: booking.updatedAt,
            createdAt: booking.createdAt
        })

    } catch(error) {
        next(error)
    }
})

router.delete('/:bookingId', requireAuth, async(req, res, next) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findByPk(bookingId, {
            include: [
                {
                    model: Spot
                }
            ]
        });

        if (!booking) {
            const error = new Error("Booking couldn't be found");
            error.status = 404;
            throw error;
        }

        const now = new Date();
        const bookingStartDate = new Date(booking.startDate);

        if (bookingStartDate <= now) {
            const error = new Error("Bookings that hvae been started can't be deleted");
            error.status = 403;
            throw error;
        }

        if (booking.userId !== userId && booking.Spot.ownerId !== userId) {
            const error = new Error("Forbidden");
            error.status = 403;
            throw error;
        }

        await booking.destroy();

        res.json({ message: "Successfully deleted" })

    } catch (error) {
        next(error)
    }
})
















module.exports = router;
