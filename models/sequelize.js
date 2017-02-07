var config = require('config');
var Sequelize = require('sequelize');

var opts = {
    host: config.get('mysqlConfig.host'),
    port: config.get('mysqlConfig.port'),
    username: config.get('mysqlConfig.username'),
    password: config.get('mysqlConfig.password'),
    database: config.get('mysqlConfig.database')
};

var sequelize = new Sequelize(opts.database, opts.username, opts.password, {
    host: opts.host,
    port: opts.port,
    dialect: 'mysql',
    pool: {
        max: 3,
        min: 0,
        idle: 10000
    },
    define: {
        timestamps: false, // true by default
        freezeTableName: true
    },
    timezone: '+08:00'
});

module.exports = sequelize;
