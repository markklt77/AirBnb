'use strict';

const { Spot } = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await Spot.bulkCreate([
        {
          ownerId: 1,
          address: '1342 bum place',
          city: 'Kent',
          state: 'Washignton',
          country: 'farmville',
          lat: 134.34,
          lng: 343.34,
          name: 'Great Place',
          description: 'Lovely area',
          price: 24.50
        },
        {
          ownerId: 2,
          address: '134343 great place',
          city: 'boon',
          state: 'Maryland',
          country: 'USA',
          lat: 13343.34,
          lng: 33434.34,
          name: 'Bad Place',
          description: 'Bad area',
          price: 10.45
        },
      ], { validate: true })
    } catch(err) {
      console.log(err)
    }

  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots'
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: {[Op.in]: [1, 2]}
    }, {})
  }
};
