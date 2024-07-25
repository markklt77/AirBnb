'use strict';

const { SpotImage } = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await SpotImage.bulkCreate([
        {
          spotId: 1,
          url: 'randomImageUrl1',
          preview: true
        },
        {
          spotId: 2,
          url: 'randomImageUrl2',
          preview: true
        }
      ], { validate: true })
    } catch(err) {
      console.log(err)
    }

  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages'
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: {[Op.in]: [1, 2]}
    })
  }
};
