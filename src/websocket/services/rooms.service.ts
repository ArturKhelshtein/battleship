import { WebSocketServer } from 'ws';

import IBattleshipWebSocket from '../../types/battleshipWebSocket.type';
import { dataUpdateRoom, resUpdateRoom } from '../../types/res.types';
import { createGame } from './game.service';
import { room, updateRoom } from '../../types/room.types';
import rooms from '../../db/rooms';
import players from '../../db/players';

function createRoom(wss: WebSocketServer, ws: IBattleshipWebSocket, id: number) {
    const roomId = crypto.randomUUID().toString();

    console.log(`User ${ws.playerName} create room ${roomId}`);

    const newRoom: room = {
        index: roomId,
        usersId: [],
    };
    rooms.push(newRoom);

    addUserToRoom(ws, newRoom.index);
    console.log(newRoom);

    createGame(ws, roomId, id);
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

    const res: resUpdateRoom = {
        type: 'update_room',
        data: JSON.stringify(roomWithOnePlayer),
        id,
    };

    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(res));
        }
    });
}

export { createRoom, addUserToRoom, updateRooms }