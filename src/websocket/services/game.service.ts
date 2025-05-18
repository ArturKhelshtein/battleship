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
    const { gameId, ships, indexPlayer } = readyPlayer;

    const isFirstPlayer = !games.some(game => game.gameId === gameId);

    const preparedShips = ships.map(ship => ({
        ...ship,
        stamina: ship.length,
    }));

    const playerGame: game = {
        gameId,
        ships: preparedShips,
        playerIndex: indexPlayer,
        ...(isFirstPlayer && { startedPlayerIndex: indexPlayer }),
        shots: [],
    };

    games.push(playerGame);

    const gamePlayers: game[] = games.filter(game => game.gameId === gameId);

    if (gamePlayers.length > 1) {
        wss.clients.forEach(client => {
            const clientBS = client as IBattleshipWebSocket;

            if (client.readyState !== client.OPEN) {
                return;
            }

            const clientGame = gamePlayers.find(game => game.playerIndex === clientBS.playerIndex);

            if (!clientGame) {
                return;
            }

            const isCurrentPlayerFirst =
                gamePlayers.find(game => game.startedPlayerIndex)?.startedPlayerIndex === clientBS.playerIndex;

            const ships = clientGame?.ships || [];
            const dataString: dataStartGame = {
                ships,
                currentPlayerIndex: readyPlayer.indexPlayer,
            };

            client.send(JSON.stringify(preparingRes(resType.start_game, dataString, id)));

            if (isCurrentPlayerFirst) {
                turn(clientBS, id);
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

function shoot(
    wss: WebSocketServer,
    ws: IBattleshipWebSocket,
    attack: { gameId: string; x: number; y: number; indexPlayer: string },
    id: number
) {
    const { gameId, x, y, indexPlayer } = attack;

    const gameDefencePlayer = games.find(game => game.gameId === gameId && game.playerIndex !== ws.playerIndex);

    if (!gameDefencePlayer) {
        return;
    }

    const alreadyShot = gameDefencePlayer.shots.some(pos => pos.x === x && pos.y === y);

    if (alreadyShot) {
        return;
    }

}

export { createGame, joinGame, startGame, shoot };
