var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var TBL = sequelize.define('t_media_local_url', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    media_type: {
        type: Sequelize.STRING
    },
    media_id: {
        type: Sequelize.STRING,
        unique: true
    },
    media_name: {
        type: Sequelize.STRING
    },
    media_url: {
        type: Sequelize.STRING
    },
    update_time: {
        type: Sequelize.BIGINT
    },
    local_url: {
        type: Sequelize.STRING
    }
}, {
    tableName: 't_media_local_url'
});

module.exports = TBL;