import { WebSocketServer } from 'ws';

import message from '../types/message.types';
import { registration } from './services/registration.services';
import { createRoom, joinRoom, updateRooms } from './services/rooms.service';
import ship from '../types/ship.types';
import { startGame } from './services/game.service';

function handleMessage(wss: WebSocketServer, ws: any, message: string) {
    try {
        const messageStr = message.toString();
        const req: message = JSON.parse(messageStr);
        console.log(`Request: ${JSON.stringify(req, null, 4)}`);

        let data: object | null = null;

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
            case 'add_user_to_room':
                const roomData = data as { indexRoom: string };
                joinRoom(wss, ws, roomData.indexRoom, req.id);
                updateRooms(wss, req.id);
                break;
            case 'add_ships':
                const readyPlayer = data as { gameId: string; ships: ship[]; indexPlayer: string };
                startGame(wss, readyPlayer, req.id);
                break;
            case 'attack':
                break;
            default:
                console.log(`Unknown message type: ${req.type}`);
        }
    } catch (error) {
        console.error('Invalid JSON', error);
    }
}

export default handleMessage;
