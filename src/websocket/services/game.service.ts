import IBattleshipWebSocket from "../../types/battleshipWebSocket.type";
import { resCreateGame, dataCreateGame } from "../../types/res.types";


function createGame(ws: IBattleshipWebSocket, roomId: string, id: number) {
    const dataString: dataCreateGame = {
        idGame: roomId,
        idPlayer: ws.playerIndex,
    };
    const res: resCreateGame = {
        type: 'create_game',
        data: JSON.stringify(dataString),
        id,
    };

    ws.send(JSON.stringify(res));
}

function joinGame(ws: IBattleshipWebSocket, gameId: string, id: number) {
    const dataString: dataCreateGame = {
        idGame: gameId,
        idPlayer: ws.playerIndex,
    };
    const res: resCreateGame = {
        type: 'create_game',
        data: JSON.stringify(dataString),
        id,
    };

    ws.send(JSON.stringify(res));
}

export { createGame, joinGame };
