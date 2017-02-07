var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var TBL = sequelize.define('t_menu_data', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    menu_type: {
        type: Sequelize.STRING,
        unique: true
    },
    menu_data: {
        type: Sequelize.TEXT
    }
}, {
    tableName: 't_menu_data'
});

module.exports = TBL;