var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var TBL = sequelize.define('t_state_url_map', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    state: {
        type: Sequelize.STRING
    },
    url: {
        type: Sequelize.STRING
    },
    invalid_time: {
        type: Sequelize.BIGINT
    }
}, {
    tableName: 't_state_url_map'
});

module.exports = TBL;