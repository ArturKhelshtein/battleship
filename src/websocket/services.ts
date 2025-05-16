import player from '../types/player.types';
import { resReg } from '../types/res.types';

const players: player[] = [];

function registration(ws: WebSocket, data: { name: string; password: string }, id: number) {
    const { name, password } = data;

    console.log(`Registration player: ${name}`);

    const existingPlayer = players.find(player => player.name === name);
    let res: resReg;

    if (existingPlayer) {
        const dataString = JSON.stringify({
            name,
            index: existingPlayer.index,
            error: true,
            errorText: 'Player already exists',
        });

        res = {
            type: 'reg',
            data: dataString,
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

    const dataString = JSON.stringify({
        name,
        index: newPlayer.index,
        error: false,
        errorText: '',
    });

    res = {
        type: 'reg',
        data: dataString,
        id,
    };

    ws.send(JSON.stringify(res));
}

export default registration;
