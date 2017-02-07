var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var _Table = sequelize.define('t_template_list', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    type: {
        type: Sequelize.STRING,
        unique: true,
    },
    title: {
        type: Sequelize.STRING
    },
    rel_template_id: {
        type: Sequelize.STRING
    },
    data_desc: {
        type: Sequelize.TEXT
    },
    mtime: {
        type: Sequelize.DATE
    },
    ctime: {
        type: Sequelize.DATE
    }
}, {
    tableName: 't_template_list'
});

module.exports = _Table;