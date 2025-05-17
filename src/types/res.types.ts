enum typeOutgoingMessage {
    'reg',
    'update_winners',
    'create_game',
    'update_room',
    'start_game',
    'attack',
    'turn',
    'finish',
}

type resReg = {
    type: 'reg';
    data: string;
    id: number;
};

type dataReg = {
    name: string;
    index: string;
    error: boolean;
    errorText: string;
};

type resCreateGame = {
    type: 'create_game';
    data: string;
    id: number;
};

type dataCreateGame = {
    idGame: string;
    idPlayer: string;
};

export { resReg, dataReg, resCreateGame, dataCreateGame };
