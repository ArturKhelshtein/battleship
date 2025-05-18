import ship from './ship.types';

type game = {
    gameId: string;
    ships: ship[];
    playerIndex: string;
    startedPlayerIndex?: string;
};

export default game;
