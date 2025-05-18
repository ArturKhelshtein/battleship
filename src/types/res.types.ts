import { updateRoom } from './room.types';
import ship from './ship.types';

enum resType {
    reg = 'reg',
    update_winners = 'update_winners',
    create_game = 'create_game',
    update_room = 'update_room',
    start_game = 'start_game',
    attack = 'attack',
    turn = 'turn',
    finish = 'finish',
}

type dataReg = {
    name: string;
    index: string;
    error: boolean;
    errorText: string;
};

type dataCreateGame = {
    idGame: string;
    idPlayer: string;
};

type dataUpdateRoom = updateRoom[];

type dataStartGame = {
    ships: ship[];
    currentPlayerIndex: string;
};

type dataTurn = {
    currentPlayer: string;
}

export { resType, dataReg, dataCreateGame, dataUpdateRoom, dataStartGame, dataTurn };
