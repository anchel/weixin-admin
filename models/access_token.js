var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var AccessToken = sequelize.define('t_access_token', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    platform: {
        type: Sequelize.INTEGER,
        unique: true
    },
    access_token: {
        type: Sequelize.STRING
    },
    expire_time: {
        type: Sequelize.BIGINT
    }
}, {
    tableName: 't_access_token'
});

module.exports = AccessToken;