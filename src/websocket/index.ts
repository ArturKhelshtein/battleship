import WebSocket, { WebSocketServer } from 'ws';

import message from '../types/message';
import { registration, createRoom } from './services';

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
                console.log(`Request: ${JSON.stringify(req, null, 4)}`);

                let data: object;
                if (req.data) {
                    data = JSON.parse(req.data);
                }

                switch (req.type) {
                    case 'reg':
                        registration(ws, data! as { name: string; password: string }, req.id);
                        break;
                    case 'create_room':
                        createRoom(ws, req.id);
                        break;
                    default:
                        console.log(`Unknown message type: ${req.type}`);
                }
            } catch {
                console.error('Invalid JSON');
            }
        });
    });
}
