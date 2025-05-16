import player from '../types/player.types';
import { resReg, dataReg } from '../types/res.types';

const players: player[] = [];

function registration(ws: WebSocket, data: { name: string; password: string }, id: number) {
    const { name, password } = data;

    console.log(`Registration player: ${name}`);

    const existingPlayer = players.find(player => player.name === name);
    let res: resReg;
    let dataString: dataReg;

    if (existingPlayer) {
        dataString = {
            name,
            index: existingPlayer.index,
            error: true,
            errorText: 'Player already exists',
        };

        res = {
            type: 'reg',
            data: JSON.stringify(dataString),
            id,
        };

        ws.send(JSON.stringify(res));
        return;
    }

    const newPlayer = {
        name,
        password,
        index: crypto.randomUUID(),
    };
    players.push(newPlayer);

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

    ws.send(JSON.stringify(res));
}

export default registration;
