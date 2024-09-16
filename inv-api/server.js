'use strict';

const
  restify = require('restify')
  , restifyPlugins = require('restify').plugins
  , corsMiddleware = require('restify-cors-middleware')
  , passport = require('passport')
  , BearerStrategy = require('passport-azure-ad').BearerStrategy
  //, jsonBodyParser = require('restify-plugin-json-body-parser')
  , rjwt = require('restify-jwt-community')
  ;

const
  config = require('./config/config')
  , azureConfig = require('./config/azure-config')
  , db = require('./models')
  ;

//const prospectRoutes = require("./routes/prospects");

const authenticatedUserTokens = [];
const authenticationStrategy = new BearerStrategy(azureConfig.credentials, (token, done) => {
  let currentUser = null;
  let userToken = authenticatedUserTokens.find((user) => {
    currentUser = user;
    user.sub === token.sub;
  });
  if (!userToken) {
    currentUser = token;
    authenticatedUserTokens.push(token);
  }
  return done(null, currentUser, token);
});
passport.use(authenticationStrategy);

const server = restify.createServer({ name: 'INV-API' });

server.use(restifyPlugins.bodyParser());
//server.use(jsonBodyParser());
//server.use(restifyPlugins.jsonBodyParser());
server.use(restifyPlugins.queryParser());
server.use(restifyPlugins.authorizationParser());
server.use(passport.initialize());
server.use(passport.session());

server.use((req, res, next) => { console.log(req.url); next(); });
const cors = corsMiddleware({
  origins: config.corsOrigins,
  allowHeaders: ["Authorization"],
  exposeHeaders: ["Authorization"]
});
server.use((req, res, next) => { console.log('post cors invoke 1'); next(); });
server.pre(cors.preflight);
server.use(cors.actual);

server.use((req, res, next) => { console.log('post cors invoke 2'); next(); });

const securedRouter = require('./routes/secured');
// securedRouter.use(passport.authenticate('oauth-bearer', { session: false }));
securedRouter.applyRoutes(server, '/api');
server.use((req, res, next) => { console.log('post cors invoke 3'); next(); });

// const internalApiRouter = require('./routes/internal-api');
// internalApiRouter.use(passport.authenticate('oauth-bearer', { session: false }));
// internalApiRouter.applyRoutes(server, '/api');

// const externalApiRouter = require('./routes/external-api');
// externalApiRouter.use(rjwt({"secret": "test-api-shared-secret"}).unless({ path: ['auth', '/external/api/auth','/external/api/createpassword']}));
// externalApiRouter.applyRoutes(server, '/external/api');

server.use((req, res, next) => { console.log('post cors invoke 3'); next(); });

const openRouter = require('./routes/open');
openRouter.applyRoutes(server, '/open/api');

//prospectRoutes.applyRoutes(server, "/open/api");

server.get('/', function (req, res) {
  res.send(401, 'This is for Authorized API  access only');
});

server.listen(config.apiServerPort, () => { console.log('listenting.. server name: ' + server.name + ' url: ' + server.url); });
