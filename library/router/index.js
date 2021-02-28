const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const getNodeConnections = require('./getNodeConnections');
const getNodeConnectionCount = require('./getNodeConnectionCount');
const getUserConnectionCount = require('./getUserConnectionCount');
const isUserConnectedToNode = require('./isUserConnectedToNode');
const markConnected = require('./markConnected');
const markDisconnected = require('./markDisconnected');
const nodeAuthentication = require('./nodeAuthentication');

const router = new Router();
router.use(bodyParser());

router.post('/get-node-connections', getNodeConnections);
router.post('/get-server-connection-count', getNodeConnectionCount);// old alias, should migrate to new
router.post('/get-node-connection-count', getNodeConnectionCount);
router.post('/get-user-connection-count', getUserConnectionCount);
router.post('/is-user-connected-to-node', isUserConnectedToNode);
router.post('/mark-connected', markConnected);
router.post('/mark-disconnected', markDisconnected);
router.post('/node-authentication', nodeAuthentication);
router.post('/nodeauth', nodeAuthentication);// alias

module.exports = router;
