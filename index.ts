import 'dotenv/config';

import { httpServer } from "./src/http_server/index.js";
import { startWebSocketServer } from "./src/websocket/index.js";

const HTTP_PORT = Number(process.env.HTTP_PORT ?? 8181)
const WEB_SOCKET_PORT = Number(process.env.WEB_SOCKET_PORT ?? 3000)

httpServer.listen(HTTP_PORT, () => {
    console.log(`Start static http server on the ${HTTP_PORT} port!`);
});

startWebSocketServer({ port: WEB_SOCKET_PORT, path: '/'});
