import { WebSocketServer } from 'ws';
import IBattleshipWebSocket from '../../types/battleshipWebSocket.types';
import { addUserToRoom, createRoom } from './rooms.service';
import rooms from '../../db/rooms';
import { createGame } from './game.service';
import { room } from '../../types/room.types';
import ship from '../../types/ship.types';

function createSinglePlayRoom(wss: WebSocketServer, ws: IBattleshipWebSocket, id: number) {
    const roomId = crypto.randomUUID().toString();

    console.log(`User ${ws.playerName} starts single play in room ${roomId}`);

    const newRoom: room = {
        index: roomId,
        usersId: [],
        isPrivate: true,
    };

    rooms.push(newRoom);

    addUserToRoom(ws, roomId);
    createGame(ws, roomId, id);
}

function generateRandomShips(): ship[] {
    const shipsConfig = [
        { length: 4, count: 1 },
        { length: 3, count: 2 },
        { length: 2, count: 3 },
        { length: 1, count: 4 },
    ];

    const board = Array(10)
        .fill(null)
        .map(() => Array(10).fill(0));

    const ships: ship[] = [];

    const getShipType = (length: number): ship['type'] => {
        switch (length) {
            case 1:
                return 'small';
            case 2:
                return 'medium';
            case 3:
                return 'large';
            case 4:
                return 'huge';
            default:
                throw new Error('Invalid ship length');
        }
    };

    const isValid = (x: number, y: number, length: number, horizontal: boolean): boolean => {
        for (let i = 0; i < length; i++) {
            const dx = horizontal ? x + i : x;
            const dy = horizontal ? y : y + i;

            if (dx < 0 || dx >= 10 || dy < 0 || dy >= 10) return false;

            for (let a = -1; a <= 1; a++) {
                for (let b = -1; b <= 1; b++) {
                    const nx = dx + a;
                    const ny = dy + b;
                    if (nx >= 0 && ny >= 0 && nx < 10 && ny < 10 && board[nx][ny] === 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const placeShip = (length: number) => {
        while (true) {
            const horizontal = Math.random() < 0.5;
            const x = Math.floor(Math.random() * (horizontal ? 10 - length : 10));
            const y = Math.floor(Math.random() * (horizontal ? 10 : 10 - length));

            if (isValid(x, y, length, horizontal)) {
                for (let i = 0; i < length; i++) {
                    const dx = horizontal ? x + i : x;
                    const dy = horizontal ? y : y + i;
                    board[dx][dy] = 1;
                }

                ships.push({
                    length,
                    type: getShipType(length),
                    position: { x, y },
                    direction: horizontal,
                    stamina: length,
                });

                return;
            }
        }
    };

    shipsConfig.forEach(({ length, count }) => {
        for (let i = 0; i < count; i++) {
            placeShip(length);
        }
    });

    return ships;
}

export { createSinglePlayRoom, generateRandomShips };
