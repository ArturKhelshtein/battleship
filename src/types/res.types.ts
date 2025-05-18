import { updateRoom } from "./room.types";

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

type resBase<T> = {
    type: T;
    data: string;
    id: number;
};

type resReg = resBase<'reg'>;
type resCreateGame = resBase<'create_game'>;
type resUpdateRoom = resBase<'update_room'>;

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

export { resReg, dataReg, resCreateGame, dataCreateGame, resUpdateRoom, dataUpdateRoom };
