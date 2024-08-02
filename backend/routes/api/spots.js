const express = require('express')
const { Op, fn, col } = require('sequelize');
const { Spot } = require('../../db/models')
const { Review } = require('../../db/models')
const { SpotImage } = require('../../db/models')
const { User } = require('../../db/models')
const { ReviewImage} = require('../../db/models')
const { requireAuth } = require('../../utils/auth')
const { sequelize } = require('../../db/models')
const { Booking } = require('../../db/models')

const router = express.Router();

router.get('/:spotId/bookings', requireAuth, async(req, res, next) => {
    try {
        const { spotId } = req.params;
        const userId = req.user.id;

        const spot = await Spot.findByPk(spotId)

        if (!spot) {
            const error = new Error("Spot couldn't be found")
            error.status = 404;
            throw error
        }

        const isOwner = userId === spot.ownerId;

        const includeOptions = isOwner ? [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }
        ] : [];

        const bookings = await Booking.findAll({
            where: { spotId },
            include: includeOptions
        });

        const response = {
            Bookings: bookings.map(booking => {
                const bookingData = {
                    spotId: booking.spotId,
                    startDate: new Date(booking.startDate).toLocaleDateString('en-CA'),
                    endDate: new Date(booking.endDate).toLocaleDateString('en-CA'),
                };

                if (isOwner) {
                    bookingData.User = {
                        id: booking.User.id,
                        firstName: booking.User.firstName,
                        lastName: booking.User.lastName
                    };
                    bookingData.id = booking.id,
                    bookingData = booking.userId,
                    bookingData.createdAt = booking.createdAt,
                    bookingData.updatedAt = booking.updatedAt
                }

                return bookingData;
            })
        };

        res.status(200).json(response);


    } catch (error) {
        next(error)
    }




})

router.get('/:spotId/reviews', async (req, res, next) => {
    const { spotId } = req.params;

    try {
        const spot = await Spot.findByPk(spotId)
        if (!spot) {
            // return res.status(404).json({message: "Spot couldn't be found"})
            const error = new Error("Spot couldn't be found")
            error.status = 404
            throw error
        }

        const reviews = await Review.findAll({
            where: {
                spotId: spotId
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: ReviewImage,
                    attributes: ['id', 'url']
                }
            ]
        })

        res.status(200).json({ Reviews: reviews})
    } catch(err) {
        next(err)
    }
})

router.get('/current', requireAuth, async (req, res, next) => {
    const { user } = req;
    const currentUserId = user.id

    const spots = await Spot.findAll({
        attributes: {
            include: [
                [
                    fn('AVG', col('Reviews.stars')),
                    'averageStarRating'
                ],
                [
                    sequelize.literal(`(
                      SELECT url
                      FROM SpotImages
                      WHERE SpotImages.spotId = Spot.id
                      AND SpotImages.preview = true
                      LIMIT 1
                    )`),
                    'previewImage'
                ]
            ]
        },
        include: [
            // {
            //     model: SpotImage,
            //     attributes: ['id', 'url', 'preview']
            // },
            {
                model: Review,
                attributes: []
            }
        ],
        where: {
            ownerId: currentUserId
        },
        group: ['Spot.id']
    })
    res.json(spots)
})

router.get('/:spotId', async (req, res, next) => {

    const spot = await Spot.findOne({
        where: {
            id: req.params.spotId
        },
        attributes: {
            include: [
                [
                    fn('AVG', col('Reviews.stars')),
                    'averageStarRating'
                ]
            ]
        },
        include: [
            {
                model: SpotImage,
                attributes: ['id', 'url', 'preview']
            },
            {
                model: User,
                as: 'Owner',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Review,
                attributes: []
            }
        ],
        group: ['Spot.id', 'SpotImages.id']
    })
    if (!spot) res.status(404).json({message: "Spot couldn't be found"})
    res.json(spot)
})



router.get('/', async (req, res, next) => {
    try {
        const {
            page = 1,
            size = 20,
            minLat,
            maxLat,
            minLng,
            maxLng,
            minPrice,
            maxPrice
        } = req.query;

        const errors = {};

        if (page < 1) {
            errors.page = 'Page must be greater than or equal to 1';
        }
        if (size < 1 || size > 20) {
            errors.size = 'Size must be between 1 and 20';
        }
        if (minLat && isNaN(minLat)) {
            errors.minLat = "Minimum latitude is invalid";
        }
        if (maxLat && isNaN(maxLat)) {
            errors.maxLat = "Maximum latitude is invalid";
        }
        if (minLng && isNaN(minLng)) {
            errors.minLng = "Minimum longitude is invalid";
        }
        if (maxLng && isNaN(maxLng)) {
            errors.maxLng = "Maximum longitude is invalid";
        }
        if (minPrice && isNaN(minPrice)) {
            errors.minPrice = "Minimum price must be greater than or equal to 0";
        }
        if (maxPrice && isNaN(maxPrice)) {
            errors.maxPrice = "Maximum price must be greater than or equal to 0";
        }

        if (Object.keys(errors).length) {
            return res.status(400).json({
                message: "Bad Request",
                errors
            });
        }

        const pageNum = parseInt(page, 10);
        const sizeNum = parseInt(size, 10);
        const minLatNum = minLat ? parseFloat(minLat) : undefined;
        const maxLatNum = maxLat ? parseFloat(maxLat) : undefined;
        const minLngNum = minLng ? parseFloat(minLng) : undefined;
        const maxLngNum = maxLng ? parseFloat(maxLng) : undefined;
        const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
        const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;

        const where = {};
        if (minLatNum) where.lat = { [Op.gte]: minLatNum };
        if (maxLatNum) where.lat = { ...where.lat, [Op.lte]: maxLatNum };
        if (minLngNum) where.lng = { [Op.gte]: minLngNum };
        if (maxLngNum) where.lng = { ...where.lng, [Op.lte]: maxLngNum };
        if (minPriceNum) where.price = { [Op.gte]: minPriceNum };
        if (maxPriceNum) where.price = { ...where.price, [Op.lte]: maxPriceNum };

        const offset = (pageNum - 1) * sizeNum;
        const limit = sizeNum;

        const spots = await Spot.findAll({
            where,
            offset,
            limit,
            attributes: {
                include: [
                    [
                        fn('AVG', col('Reviews.stars')),
                        'avgRating'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT url
                            FROM SpotImages
                            WHERE SpotImages.spotId = Spot.id
                            AND SpotImages.preview = true
                            LIMIT 1
                        )`),
                        'previewImage'
                    ]
                ]
            },
            include: [
                {
                    model: Review,
                    attributes: []
                }
            ],
            group: ['Spot.id'],
            subQuery: false // Ensures correct grouping with limit and offset
        });

        res.status(200).json({
            Spots: spots,
            page: pageNum,
            size: sizeNum
        });
    } catch (error) {
        next(error);
    }
});

router.post('/:spotId/bookings', requireAuth, async(req, res, next) => {
    try {
        const spotId = req.params.spotId
        const { userId } = req.user.id
        const { startDate, endDate } = req.body;
        console.log(startDate)
        console.log(endDate)

        //quick validation check before i waste my time
        const bookingInstance = Booking.build({
            spotId: req.params.spotId,
            userId: req.user.id,
            startDate,
            endDate
        });

        await bookingInstance.validate();

        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            const error = new Error("Spot couldn't be found");
            error.status = 404;
            throw error
        }

        if (spot.ownerId === userId) {
            const error = new Error("Forbidden");
            error.status = 403;
            throw error
        }

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


        let newBooking = await Booking.create({
            spotId: Number(spotId),
            userId: req.user.id,
            startDate: startDate,
            endDate: endDate
        });

        res.status(201).json({
            id: newBooking.id,
            spotId: Number(spotId),
            userId: req.user.id,
            startDate: startDate,
            endDate: endDate,
            updatedAt: newBooking.updatedAt,
            createdAt: newBooking.createdAt
        });

    } catch(error) {
        next(error)
    }
})

router.post('/:spotId/reviews', requireAuth, async (req, res, next) => {
    const { spotId }= req.params;
    const { review, stars } = req.body;
    const userId = req.user.id;

    try {
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            const error = new Error("Spot couldn't be found")
            error.status = 404
            throw error
        }


        const existingReview = await Review.findOne({
            where: {
                userId,
                spotId
            }
        });
        if (existingReview) {
            const error = new Error("User already has a review for this spot")
            error.status = 500;
            throw error
        }


        const newReview = await Review.create({
            userId,
            spotId,
            review,
            stars
        });

        res.status(201).json(newReview);

    } catch (error) {
        next(error)
    }
})

router.post('/:spotId/images', requireAuth, async (req, res, next) => {
    const { url,preview } = req.body
    try {
        const spot = await Spot.findByPk(req.params.spotId)
        if (!spot) {
            // return res.status(404).json({message: "Spot couldn't be found"})
            const error = new Error("Spot couldn't be found")
            error.status = 404
            throw error
        }
        if (spot.ownerId !== req.user.id) {
            // return res.status(403).json({ message: 'Forbidden' });
            const error = new Error("Forbidden")
            error.status = 403
            throw error
        }

        const newImage = await SpotImage.create({
            spotId: req.params.spotId,
            url,
            preview
        })

        res.status(201).json({
            id: newImage.id,
            url: newImage.url,
            preview: newImage.preview
        })
    }catch (err) {
        next(err)
    }
})

router.post('/', requireAuth, async(req, res, next) => {
    try {
        const { user } = req
        const currentUserId = user.id
        const { address, city, state, country, lat, lng, name, description, price } = req.body
        const newSpot = await Spot.create( {ownerId: currentUserId, address, city, state, country, lat, lng, name, description, price } )

        res.status(201).json(newSpot)
    } catch(err) {
        next(err)
    }

})

router.put('/:spotId', requireAuth, async(req, res, next) => {
    try {
        const { address, city, state, country, lat, lng, name, description, price } = req.body

        const spot = await Spot.findByPk(req.params.spotId)
        if (!spot) {
            // return res.status(404).json({message: "Spot couldn't be found"})
            const error = new Error("Spot couldn't be found")
            error.status = 404
            throw error
        }
        if (spot.ownerId !== req.user.id) {
            // return res.status(403).json({ message: 'Forbidden' });
            const error = new Error('Forbidden')
            error.status = 403
            throw error
        }



        spot.set({
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price
        });

        await spot.validate()

        await spot.save()

        res.status(200).json(spot);
    } catch(err) {
        next(err)
    }

})

router.delete('/:spotId', requireAuth, async (req, res, next) => {
    const { spotId } = req.params

    try {
        const spot = await Spot.findByPk(spotId)

        if (!spot) {
            const error = new Error("Spot couldn't be found")
            error.status = 404
            throw error
        }

        if (spot.ownerId !== req.user.id) {
            const error = new Error('Forbidden')
            error.status = 403
            throw error
        }

        await spot.destroy();

        res.status(200).json({ message: 'Successfully deleted' });
    } catch (err) {
        next(err)
    }
})



module.exports = router
