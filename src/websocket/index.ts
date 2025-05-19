import WebSocket, { WebSocketServer } from 'ws';
import handleMessage from './hanldeMessage';

export function startWebSocketServer({ port, path }: { port: number; path: string }) {
    const wss = new WebSocketServer({ port: port, path: path });
    console.log(`WebSocket server on the ${port} port!`);

    wss.on('connection', (ws: WebSocket): void => {
        console.log('New player connected');

        ws.send(JSON.stringify({ type: 'greeting' }));

        ws.on('message', (message: WebSocket.RawData): void => {
            handleMessage(wss, ws, message.toString());
        });
    });
}
