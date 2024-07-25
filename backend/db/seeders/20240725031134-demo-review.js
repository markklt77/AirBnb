'use strict';


const { Review } = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await Review.bulkCreate([
        {
          spotId: 1,
          userId: 1,
          review: 'Love it',
          stars: 5
        },
        {
          spotId: 2,
          userId: 2,
          review: 'Bum ahh place',
          stars: 1
        }
      ], { validate: true })
    } catch (err) {
      console.log(err)
    }

  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews'
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: {[Op.in]: [1, 2]}
    }, {})
  }
};
