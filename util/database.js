const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'MySql2019', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;

/*
Old logic which only uses mysql2
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: 'MySql2019'
});

module.exports = pool.promise();*/