const ffrpc = async(ctx, next) => {
  const authToken = ctx.get('authorization');

  // authorizing client
  ctx.state.rpcAuthorization = authToken && process.env.FFRPC_AUTH_TOKEN === authToken;

  await next();
}

module.exports = ffrpc;
