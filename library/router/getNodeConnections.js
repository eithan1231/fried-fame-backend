const assert = require('assert');
const mysql = require('../config/mysql');
const mysqlPromise = mysql.promise();

const getNodeConnections = async(node) => {
	assert(typeof node === 'number');

	const [rows, fields] = await mysqlPromise.execute(`
		SELECT
			id,
			user_id,
			node_id,
			connect_date,
			disconnect_date,
			localip,
			data_sent,
			data_received
		FROM
			connections
		WHERE
			node_id = ? AND
			disconnect_date = 0
	`, [node]);

	return rows;
}

const controller = async(ctx, next) =>
{
  if(!ctx.state.rpcAuthorization) {
    // Unauthenticated
    return ctx.status = 401;
  }

  if(typeof ctx.request.body != 'object') {
    // bad request status
    return ctx.status = 401;
  }

	if(typeof ctx.request.body.node !== 'number') {
		// Yet again, bad request - Server node invalid
		return ctx.status = 401;
	}

	const connections = await getNodeConnections(ctx.request.body.node);

	ctx.body = connections;
	ctx.status = 200;
}

module.exports = controller;
module.exports.getNodeConnections = getNodeConnections;
