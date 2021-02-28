const assert = require('assert');
const mysql = require('../config/mysql');
const mysqlPromise = mysql.promise();

const getNodeConnectionCount = async(node) => {
	assert(typeof node === 'number');

	const [[ row ], fields] = await mysqlPromise.execute(`
		SELECT
			count(1) as cnt
		FROM
			connections
		WHERE
			node_id = ? AND
			disconnect_date = 0
	`, [node]);

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

	if(typeof ctx.request.body.node !== 'number') {
		// Yet again, bad request - Server node invalid
		return ctx.status = 401;
	}

	const connectionCount = await getNodeConnectionCount(ctx.request.body.node);

	ctx.body = connectionCount;
	ctx.status = 200;
}

module.exports = controller;
module.exports.getNodeConnectionCount = getNodeConnectionCount;
