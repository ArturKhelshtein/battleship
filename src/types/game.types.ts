import ship from './ship.types';

type game = {
    gameId: string;
    ships: ship[];
    playerIndex: string;
};

export default game;
