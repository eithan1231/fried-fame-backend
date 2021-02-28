const mysql = require('../config/mysql');
const mysqlPromise = mysql.promise();

const getNodeConnectionCount = require('./getNodeConnectionCount').getNodeConnectionCount;
const getUserConnectionCount = require('./getUserConnectionCount').getUserConnectionCount;


// Get Node Information
const getNodeInformation = async(id) => {
	const [rows, fields] = await mysqlPromise.execute(`SELECT * FROM vpn_nodes WHERE id = ?`, [id]);
	return rows.length ? rows[0] : null;
}


// get userid from email, returns null on invalid
const getUserIDByUserID = async(id) => {
	// basically validates user id exists.
	const [rows, fields] = await mysqlPromise.execute(`SELECT id FROM users WHERE id = ?`, [id]);
	return rows.length ? rows[0].id : null;
}


// gets subscription information (plus some user information)
const getSubscriptionInformation = async(user) => {
	const [rows, fields] = await mysqlPromise.execute(`
		SELECT
			users.id AS user_id,
			users.email AS user_email,
			users.email_valid AS user_email_valid,
			users.group_id AS user_group_id,
			users.node_auth AS user_node_auth,

			user_subscriptions.subscrption_plan_id AS subscrption_plan_id,
			user_subscriptions.date AS subscription_data,
			user_subscriptions.expiry AS subscription_expiry,
			user_subscriptions.enabled AS subscription_enabled,

			subscription_plans.enabled AS subscription_plan_enabled,
			subscription_plans.maximum_concurrent_connections AS subscription_plan_maximum_concurrent_connections

		FROM
			users

		INNER JOIN
			user_subscriptions
		ON
			user_subscriptions.user_id = users.id

		INNER JOIN
			subscription_plans
		ON
			user_subscriptions.subscrption_plan_id = subscription_plans.id

		WHERE
			users.id = ?
	`, [user]);

	return rows.length ? rows[0] : null;
}

/**
* nodeauth method
*/
module.exports = async(ctx, next) =>
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
		typeof ctx.request.body.node !== 'number' ||
		typeof ctx.request.body.username === 'undefined' ||
		typeof ctx.request.body.password !== 'string'
	) {
		// Yet again, bad request - Server node invalid
		return ctx.status = 401;
	}

	const nodeInformation = await getNodeInformation(ctx.request.body.node);
	if(!nodeInformation || !nodeInformation.enabled) {
		return ctx.body = {
			permitConnection: false,
			reason: 'bad-node'
		};
	}

	const nodeConnectionCount = await getNodeConnectionCount(ctx.request.body.node);
	if(nodeConnectionCount > nodeInformation.maximum_load) {
		return ctx.body = {
			permitConnection: false,
			reason: 'server-overloaded'
		};
	}

	const userId = await getUserIDByUserID(ctx.request.body.username);
	if(!userId) {
		return ctx.body = {
			permitConnection: false,
			reason: 'user-invalid'
		};
	}

	const subscriptionInformation = await getSubscriptionInformation(userId);
	if(!subscriptionInformation) {
		return ctx.body = {
			permitConnection: false,
			reason: 'missing-subscription'
		};
	}

	if(subscriptionInformation.user_node_auth !== ctx.request.body.password) {
		return ctx.body = {
			permitConnection: false,
			reason: 'bad-password'
		};
	}

	if(
		!subscriptionInformation.subscription_enabled ||
		!subscriptionInformation.subscription_plan_enabled
	) {
		return ctx.body = {
			permitConnection: false,
			reason: 'subscription-disabled'
		};
	}

	if(subscriptionInformation.subscription_expiry < Math.floor(Date.now() / 1000)) {
		return ctx.body = {
			permitConnection: false,
			reason: 'subscription-expired'
		};
	}

	const userConnectionCount = await getUserConnectionCount(userId);
	if(userConnectionCount > subscriptionInformation.subscription_plan_maximum_concurrent_connections) {
		return ctx.body = {
			permitConnection: false,
			reason: 'user-connection-overload'
		};
	}

	return ctx.body = {
		permitConnection: true
		// NOTE: Original version had
		// key: subscriptionInformation
		// and also
		// node: nodeInformation
		// but are not needed right away, and so I don't want to add them.
	};
}
