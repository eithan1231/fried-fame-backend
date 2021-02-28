const assert = require('assert');
const mysql = require('../config/mysql');
const mysqlPromise = mysql.promise();

const markConnected = async(user, node, localIp) =>
{
	assert(typeof user === 'number');
	assert(typeof node === 'number');
	assert(typeof localIp === 'string');

	await mysqlPromise.execute(`
		INSERT INTO connections
		(id, user_id, node_id, connect_date, disconnect_date, localip, data_sent, data_received)
		VALUES (
			NULL,
			?,
			?,
			UNIX_TIMESTAMP(),
			0,
			?,
			0,
			0
		)
	`, [
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
		typeof ctx.request.body.localIp !== 'string' ||
		typeof ctx.request.body.user !== 'number' ||
		typeof ctx.request.body.node !== 'number'
	) {
		// Yet again, bad request - Server node invalid
		return ctx.status = 401;
	}

	await markConnected(
		ctx.request.body.user,
		ctx.request.body.node,
		ctx.request.body.localIp
	);

	ctx.status = 200;
}


module.exports = controller
module.exports.markConnected = markConnected;
