var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var _Table = sequelize.define('t_qrcode_scene', {
    scene_id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    action_name: {
        type: Sequelize.STRING
    },
    expire_seconds: {
        type: Sequelize.BIGINT
    },
    scene_str: {
        type: Sequelize.STRING
    },
    ticket: {
        type: Sequelize.STRING
    },
    url: {
        type: Sequelize.STRING
    },
    date_start: {
        type: Sequelize.DATE
    },
    date_end: {
        type: Sequelize.DATE
    },
    mtime: {
        type: Sequelize.DATE
    },
    ctime: {
        type: Sequelize.DATE
    }
}, {
    tableName: 't_qrcode_scene'
});

module.exports = _Table;