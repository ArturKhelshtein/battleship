enum typeOutgoingMessage {
    'reg',
    'update_winners',
    'create_game',
    'update_room',
    'start_game',
    'attack',
    'turn',
    'finish'
}

type resReg = {
    type: 'reg';
    data: string,
//     name: string;
//     index: number | string;
//     error: boolean;
//     errorText: string;
// }
id: number;
};

export { resReg };
