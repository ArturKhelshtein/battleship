import { WebSocketServer } from 'ws';

import IBattleshipWebSocket from '../../types/battleshipWebSocket.types';
import { dataUpdateRoom, resType } from '../../types/res.types';
import { createGame, joinGame } from './game.service';
import { room, updateRoom } from '../../types/room.types';
import rooms from '../../db/rooms';
import players from '../../db/players';
import { preparingRes } from '../utils';

function createRoom(wss: WebSocketServer, ws: IBattleshipWebSocket, id: number) {
    const roomId = crypto.randomUUID().toString();

    console.log(`User ${ws.playerName} create room ${roomId}`);

    const newRoom: room = {
        index: roomId,
        usersId: [],
    };
    rooms.push(newRoom);

    addUserToRoom(ws, newRoom.index);
    createGame(ws, roomId, id);
    updateRooms(wss, id);
}

function joinRoom (wss: WebSocketServer, ws: IBattleshipWebSocket, roomId: string, id: number) {
    console.log(`User ${ws.playerName} join room ${roomId}`);

    addUserToRoom(ws, roomId);
    joinGame(ws, roomId, id);
    updateRooms(wss, id);
}

function addUserToRoom(ws: IBattleshipWebSocket, roomId: string) {
    console.log(`User ${ws.playerName} in room ${roomId}`);

    const room = rooms.find(room => room.index === roomId);
    if (!room) {
        return [];
    }

    if (room.usersId.includes(ws.playerIndex)) {
        return room.usersId;
    }

    room.usersId.push(ws.playerIndex);

    return room.usersId;
}

function updateRooms(wss: WebSocketServer, id: number) {
    const roomWithOnePlayer: dataUpdateRoom = rooms
        .filter(room => room.usersId.length === 1)
        .map(room => {
            const result: updateRoom = {
                roomId: room.index,
                roomUsers: [
                    {
                        name: players.find(player => player.index === room.usersId[0])?.name ?? '',
                        index: room.usersId[0],
                    },
                ],
            };

            return result;
        }); 

    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(preparingRes(resType.update_room, roomWithOnePlayer, id)));
        }
    });
}

export { createRoom, addUserToRoom, updateRooms, joinRoom }