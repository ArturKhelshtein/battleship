import { WebSocketServer } from 'ws';

import message from '../types/message.types';
import { registration } from './services/registration.services';
import { createRoom } from './services/rooms.service';

function handleMessage(wss: WebSocketServer, ws: any, message: string) {
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
                registration(wss, ws, data! as { name: string; password: string }, req.id);
                break;
            case 'create_room':
                createRoom(wss, ws, req.id);
                break;
            default:
                console.log(`Unknown message type: ${req.type}`);
        }
    } catch {
        console.error('Invalid JSON');
    }
}

export default handleMessage;
