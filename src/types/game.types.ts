import ship from './ship.types';
import shot from './shot.types';

type game = {
    gameId: string;
    ships: ship[];
    playerIndex: string;
    startedPlayerIndex?: string;
    shots: shot[];
};

export default game;
