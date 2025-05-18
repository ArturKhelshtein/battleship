import { WebSocketServer } from 'ws';

import { IPlayerWithPassword } from '../../types/player.types';
import { dataReg, resType } from '../../types/res.types';
import players from '../../db/players';
import { updateRooms } from './rooms.service';
import { preparingRes } from '../utils';

function registration(
    wss: WebSocketServer,
    ws: WebSocket & { playerIndex?: string; playerName?: string },
    data: { name: string; password: string },
    id: number
) {
    const { name, password } = data;
    console.log(`Registration player: ${name}`);
    let dataString: dataReg;
    let res;

    if (!validation(name, password)) {
        dataString = {
            name,
            index: '',
            error: true,
            errorText: 'Invalid name or password',
        };

        res = preparingRes(resType.reg, dataString, id);

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

            res = preparingRes(resType.reg, dataString, id);

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

        res = preparingRes(resType.reg, dataString, id);

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

    res = preparingRes(resType.reg, dataString, id);

    console.log(`Player ${name} registered`);
    ws.send(JSON.stringify(res));
    updateRooms(wss, id);
}

function validation(name: string, password: string) {
    if (name.length < 5 || password.length < 5) {
        return false;
    }

    return true;
}

export { registration };
