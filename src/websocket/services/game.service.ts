import { WebSocketServer } from 'ws';
import IBattleshipWebSocket from '../../types/battleshipWebSocket.type';
import { dataCreateGame, dataStartGame, resType } from '../../types/res.types';
import ship from '../../types/ship.types';
import { preparingRes } from '../utils';
import games from '../../db/games';
import game from '../../types/game.types';

function createGame(ws: IBattleshipWebSocket, roomId: string, id: number) {
    const dataString: dataCreateGame = {
        idGame: roomId,
        idPlayer: ws.playerIndex,
    };

    ws.send(JSON.stringify(preparingRes(resType.create_game, dataString, id)));
}

function joinGame(ws: IBattleshipWebSocket, gameId: string, id: number) {
    const dataString: dataCreateGame = {
        idGame: gameId,
        idPlayer: ws.playerIndex,
    };

    ws.send(JSON.stringify(preparingRes(resType.create_game, dataString, id)));
}

function startGame(
    wss: WebSocketServer,
    readyPlayer: { gameId: string; ships: ship[]; playerIndex: string },
    id: number
) {
    const playerIndex = readyPlayer.playerIndex;
    const startGameId = readyPlayer.gameId

    const userInGame: game = {
        gameId: startGameId,
        ships: readyPlayer.ships,
        playerIndex,
    };
    games.push(userInGame);

    const startGame: game[] = games.filter(game => game.gameId === startGameId);

    if (startGame.length > 1) {
        console.log(2)
        wss.clients.forEach(client => {
            const clientBS = client as IBattleshipWebSocket;

            const isYourGame = startGame.filter(game => game.playerIndex === clientBS.playerIndex);

            if (!isYourGame) {
                return;
            }
console.log(3)
            const ships =
            startGame.find(game => game.playerIndex === playerIndex)?.ships || [];

            const dataString: dataStartGame = {
                ships,
                currentPlayerIndex: readyPlayer.playerIndex,
            };
            const res = preparingRes(resType.start_game, dataString, id);

            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(res));
            }
        });
    }
}

export { createGame, joinGame, startGame };
