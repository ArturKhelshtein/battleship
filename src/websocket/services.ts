import player from '../types/player.types';
import { resReg, dataReg } from '../types/res.types';

const players: player[] = [];
const rooms = [];

function registration(ws: WebSocket & { playerIndex?: string }, data: { name: string; password: string }, id: number) {
    const { name, password } = data;
    console.log(`Registration player: ${name}`);

    const existingPlayer = players.find(player => player.name === name);
    let dataString: dataReg;
    let res: resReg;

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

            ws.send(JSON.stringify(res));
            return;
        }

        ws.playerIndex = existingPlayer.index.toString();

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

        ws.send(JSON.stringify(res));
        return;
    }

    const newPlayer = {
        name,
        password,
        index: crypto.randomUUID(),
    };
    players.push(newPlayer);
    ws.playerIndex = newPlayer.index;

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

export { registration };
