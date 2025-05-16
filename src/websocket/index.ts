import WebSocket, { WebSocketServer } from 'ws';

import message from '../types/message';
import registration from './services';

export function startWebSocketServer({ port, path }: { port: number; path: string }) {
    const wss = new WebSocketServer({ port: port, path: path });
    console.log(`WebSocket server on the ${port} port!`);

    wss.on('connection', (ws: any): void => {
        console.log('New player connected');

        ws.send(JSON.stringify({ type: 'greeting' }));

        ws.on('message', (message: WebSocket.RawData): void => {
            try {
                const messageStr = message.toString();
                const req: message = JSON.parse(messageStr);
                const data: object = JSON.parse(req.data);

                console.log(`Request: ${JSON.stringify(req, null, 4)}`);

                if (req.type === 'reg') {
                    registration(ws, data as { name: string; password: string }, req.id);
                }
            } catch {
                console.error('Invalid JSON');
            }
        });
    });
}
