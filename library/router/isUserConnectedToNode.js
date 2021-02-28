const assert = require('assert');
const mysql = require('../config/mysql');
const mysqlPromise = mysql.promise();

const isUserConnectedToNode = async(user, node) =>
{
	assert(typeof user === 'number');
	assert(typeof node === 'number');

	const [[ row ], fields] = await mysqlPromise.execute(`
		SELECT
			count(1) as cnt
		FROM
			connections
		WHERE
			node_id = ? AND
			user_id = ? AND
			disconnect_date = 0
	`, [node, user]);

	return row.cnt > 0;
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

	if(
		typeof ctx.request.body.user !== 'number' ||
		typeof ctx.request.body.node !== 'number'
	) {
		// Yet again, bad request - Server node / user invalid
		return ctx.status = 401;
	}

	const isConnected = await isUserConnectedToNode(
		ctx.request.body.user,
		ctx.request.body.node
	);

	ctx.body = isConnected;
	ctx.status = 200;
}

module.exports = controller;
module.exports.isUserConnectedToNode = isUserConnectedToNode;
