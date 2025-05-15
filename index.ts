import { httpServer } from "./src/http_server/index.js";
import 'dotenv/config';

const { HTTP_PORT = 4000 } = process.env;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
