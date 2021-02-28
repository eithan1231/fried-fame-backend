const assert = require('assert');
const mysql = require('../config/mysql');
const mysqlPromise = mysql.promise();

const markDisconnected = async(user, node, localIp, dataReceived, dataSent, disconnect_date) =>
{
	assert(typeof user === 'number');
	assert(typeof node === 'number');
	assert(typeof dataSent === 'number');
	assert(typeof dataReceived === 'number');
	assert(typeof localIp === 'string');
	assert(typeof disconnect_date === 'number');

	await mysqlPromise.execute(`
		UPDATE
			connections
		SET
			disconnect_date = ?,
			data_sent = ?,
			data_received = ?
		WHERE
			user_id = ? AND
			node_id = ? AND
			localip = ? AND
			disconnect_date = 0
	`, [
		disconnect_date,
		dataSent,
		dataReceived,

		user,
		node,
		localIp
	]);

	return true;
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
		typeof ctx.request.body.node !== 'number' ||
		typeof ctx.request.body.localIp === 'undefined' ||
		typeof ctx.request.body.dataReceived !== 'number' ||
		typeof ctx.request.body.dataSent !== 'number' ||
		typeof ctx.request.body.disconnectDate !== 'number'
	) {
		// Yet again, bad request - Server node invalid
		return ctx.status = 401;
	}

	await markDisconnected(
		ctx.request.body.user,
		ctx.request.body.node,
		ctx.request.body.localIp,
		ctx.request.body.dataReceived,
		ctx.request.body.dataSent,
		ctx.request.body.disconnectDate
	);

	ctx.status = 200;
}


/**
* markDisconnected method
*/
module.exports = controller;
module.exports.markDisconnected = markDisconnected;
