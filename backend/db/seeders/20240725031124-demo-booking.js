'use strict';

const { Booking } = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await Booking.bulkCreate([
        {
          spotId: 1,
          userId: 2,
          startDate: '2024-08-01T14:00:00Z',
          endDate:  '2024-08-07T10:00:00Z'
        },
        {
          spotId: 2,
          userId: 1,
          startDate: '2024-08-01T14:00:00Z',
          endDate:  '2024-08-07T10:00:00Z'
        }
      ], { validate: true })
    } catch (err) {
      console.log(err)
    }

  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings'
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: {[Op.in]: [1, 2]}
    })
  }
};
