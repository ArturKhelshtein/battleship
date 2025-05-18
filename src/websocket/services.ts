import { WebSocketServer } from 'ws';

import { IPlayerWithPassword } from '../types/player.types';
import { room, updateRoom as updateRooms } from '../types/room.types';
import { resReg, dataReg, dataCreateGame, resCreateGame, dataUpdateRoom, resUpdateRoom } from '../types/res.types';

const players: IPlayerWithPassword[] = [];
const rooms: room[] = [];

function registration(
    wss:WebSocketServer,
    ws: WebSocket & { playerIndex?: string; playerName?: string },
    data: { name: string; password: string },
    id: number
) {
    const { name, password } = data;
    console.log(`Registration player: ${name}`);
    let dataString: dataReg;
    let res: resReg;

    if (!validation(name, password)) {
        dataString = {
            name,
            index: '',
            error: true,
            errorText: 'Invalid name or password',
        };

        res = {
            type: 'reg',
            data: JSON.stringify(dataString),
            id,
        };

        console.log('Invalid name or password');
        ws.send(JSON.stringify(res));
        return;
    }

    const existingPlayer = players.find(player => player.name === name);

    if (existingPlayer) {
        if (password !== existingPlayer.password) {
            dataString = {
                name,
                index: existingPlayer.index,
                error: true,
                errorText: 'Wrong name or password',
            };

            res = {
                type: 'reg',
                data: JSON.stringify(dataString),
                id,
            };

            console.log('Wrong name or password');
            ws.send(JSON.stringify(res));
            return;
        }

        ws.playerIndex = existingPlayer.index;
        ws.playerName = existingPlayer.name;

        dataString = {
            name,
            index: existingPlayer.index,
            error: false,
            errorText: '',
        };

        res = {
            type: 'reg',
            data: JSON.stringify(dataString),
            id,
        };

        console.log(`Player ${name} login`);
        ws.send(JSON.stringify(res));
        return;
    }

    const newPlayer: IPlayerWithPassword = {
        name,
        password,
        index: crypto.randomUUID().toString(),
    };
    players.push(newPlayer);
    ws.playerIndex = newPlayer.index;
    ws.playerName = newPlayer.name;

    dataString = {
        name,
        index: newPlayer.index,
        error: false,
        errorText: '',
    };

    res = {
        type: 'reg',
        data: JSON.stringify(dataString),
        id,
    };

    console.log(`Player ${name} registered`);
    ws.send(JSON.stringify(res));
    updateRooms(wss, id)
}

function createRoom(wss: WebSocketServer, ws: WebSocket & { playerIndex: string; playerName: string }, id: number) {
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

function addUserToRoom(ws: WebSocket & { playerIndex: string; playerName: string }, roomId: string) {
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

function createGame(ws: WebSocket & { playerIndex: string; playerName: string }, roomId: string, id: number) {
    const dataString: dataCreateGame = {
        idGame: roomId,
        idPlayer: ws.playerIndex,
    };
    const res: resCreateGame = {
        type: 'create_game',
        data: JSON.stringify(dataString),
        id,
    };

    ws.send(JSON.stringify(res));
}

function updateRooms(wss: WebSocketServer, id: number) {
    const roomWithOnePlayer: dataUpdateRoom = rooms
        .filter(room => room.usersId.length === 1)
        .map(room => {
            const result: updateRooms = {
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

function validation(name: string, password: string) {
    if (name.length < 5 || password.length < 5) {
        return false;
    }

    return true;
}

export { registration, createRoom, addUserToRoom };
