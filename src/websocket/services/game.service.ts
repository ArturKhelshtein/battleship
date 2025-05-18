import { WebSocketServer } from 'ws';
import IBattleshipWebSocket from '../../types/battleshipWebSocket.types';
import { dataCreateGame, dataStartGame, dataTurn, resType } from '../../types/res.types';
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
    readyPlayer: { gameId: string; ships: ship[]; indexPlayer: string },
    id: number
) {
    const playerIndex = readyPlayer.indexPlayer;
    const startGameId = readyPlayer.gameId;

    const gameWithPlayer: game = {
        gameId: startGameId,
        ships: readyPlayer.ships,
        playerIndex,
    };

    const isFirstPlayer = games.every(game => game.gameId !== startGameId);

    if (isFirstPlayer) {
        gameWithPlayer.startedPlayerIndex = playerIndex;
        games.push(gameWithPlayer);
        return;
    }

    games.push(gameWithPlayer);

    const gameRecords: game[] = games.filter(game => game.gameId === startGameId);

    if (gameRecords.length > 1) {
        wss.clients.forEach(client => {
            const clientBS = client as IBattleshipWebSocket;

            const isPlayerInGame = gameRecords.some(game => game.playerIndex === clientBS.playerIndex);

            if (!isPlayerInGame) {
                return;
            }

            const playersGame = gameRecords.find(game => game.playerIndex === clientBS.playerIndex);

            if (playersGame?.startedPlayerIndex === clientBS.playerIndex) {
                turn(clientBS, id);
            }

            const ships = playersGame?.ships || [];

            const dataString: dataStartGame = {
                ships,
                currentPlayerIndex: readyPlayer.indexPlayer,
            };
            const res = preparingRes(resType.start_game, dataString, id);

            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(res));
            }
        });
    }
}

function turn(ws: IBattleshipWebSocket, id: number) {
    const dataString: dataTurn = {
        currentPlayer: ws.playerIndex,
    };

    ws.send(JSON.stringify(preparingRes(resType.turn, JSON.stringify(dataString), id)));
}

export { createGame, joinGame, startGame };
