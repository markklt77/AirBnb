'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(options || 'Users','firstName', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: ''
    })

    await queryInterface.addColumn(options || 'Users', 'lastName', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: ''
    })
  },


  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'firstName', options)
    await queryInterface.removeColumn('Users', 'lastName', options)
  }
};
