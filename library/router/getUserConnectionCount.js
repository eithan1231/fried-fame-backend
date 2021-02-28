const assert = require('assert');
const mysql = require('../config/mysql');
const mysqlPromise = mysql.promise();

const getUserConnectionCount = async(user) => {
	assert(typeof user === 'number');

	const [[ row ], fields] = await mysqlPromise.execute(`
		SELECT
			count(1) as cnt
		FROM
			connections
		WHERE
			user_id = ? AND
			disconnect_date = 0
	`, [user]);

	return row.cnt;
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

	if(typeof ctx.request.body.user !== 'number') {
		// Yet again, bad request - Server node invalid
		return ctx.status = 401;
	}

	const connectionCount = await getUserConnectionCount(ctx.request.body.user);

	ctx.body = connectionCount;
	ctx.status = 200;
}

module.exports = controller;
module.exports.getUserConnectionCount = getUserConnectionCount;
