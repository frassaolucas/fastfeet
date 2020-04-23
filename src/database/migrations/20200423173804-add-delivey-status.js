module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliveries', 'status', {
      type: Sequelize.STRING,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false,
      defaultValue: 'ready',
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('deliveries', 'status');
  },
};
