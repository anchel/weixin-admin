var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var SubscribeUser = sequelize.define('t_subscribe_user', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    subscribe: {
        type: Sequelize.INTEGER
    },
    openid: {
        type: Sequelize.STRING,
        unique: true
    },
    unionid: {
        type: Sequelize.STRING,
        unique: true
    },
    nickname: {
        type: Sequelize.STRING
    },
    sex: {
        type: Sequelize.INTEGER
    },
    headimgurl: {
        type: Sequelize.STRING
    },
    subscribe_time: {
        type: Sequelize.INTEGER
    },
    subscribe_scene_id: {
        type: Sequelize.INTEGER
    },
    groupid: {
        type: Sequelize.INTEGER
    },
    mtime: {
        type: Sequelize.DATE
    },
    ctime: {
        type: Sequelize.DATE
    }
}, {
    tableName: 't_subscribe_user'
});

module.exports = SubscribeUser;