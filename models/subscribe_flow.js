var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var SubscribeFlow = sequelize.define('t_subscribe_flow', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    type: {
        type: Sequelize.INTEGER
    },
    openid: {
        type: Sequelize.STRING
    },
    unionid: {
        type: Sequelize.STRING
    },
    scene_id: {
        type: Sequelize.INTEGER
    },
    ctime: {
        type: Sequelize.DATE
    }
}, {
    tableName: 't_subscribe_flow'
});

module.exports = SubscribeFlow;