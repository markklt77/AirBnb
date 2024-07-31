const express = require('express')
const { Op, fn, col } = require('sequelize');
const { Spot } = require('../../db/models')
const { Review } = require('../../db/models')
const { SpotImage } = require('../../db/models')
const { User } = require('../../db/models')
const { ReviewImage} = require('../../db/models')
const { requireAuth } = require('../../utils/auth')

const router = express.Router();

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
                ]
            ]
        },
        include: [
            {
                model: SpotImage,
                attributes: ['id', 'url', 'preview']
            },
            // {
            //     model: User,
            //     as: 'Owner',
            //     attributes: ['id', 'firstName', 'lastName']
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



router.get('/', async (req, res, next)  => {
    const spots = await Spot.findAll({
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
            // {
            //     model: User,
            //     as: 'Owner',
            //     attributes: ['id', 'firstName', 'lastName']
            // },
            {
                model: Review,
                attributes: []
            }
        ],
        group: ['Spot.id']
    })
    res.json(spots)
})

//Create and return a new review for a spot specified by id.
router.post('/:spotId/reviews', requireAuth, async (req, res, next) => {
    const { spotId } = req.params;
    const { review, stars } = req.body;
    const userId = req.user.id;

    try {
        // Check if the spot exists
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            const error = new Error("Spot couldn't be found")
            error.status = 404
            throw error
        }

        // Check if the user already has a review for this spot
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

        // Create the review
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
