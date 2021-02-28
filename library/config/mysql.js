const mysql = require('mysql2');

const pool = mysql.createPool({
	host: process.env.MYSQL_HOSTNAME,
	user: process.env.MYSQL_USERNAME,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	connectionLimit: 10
});

module.exports = pool;
