const http = require('http');
const app = require('./app');
const { env } = require('./config/env');

const server = http.createServer(app);

require('./modules/websocket')(server);

server.listen(env.PORT,()=>{
    console.log(`server is running on ${env.APP_BASE_URL} (port = ${env.PORT})`);
})