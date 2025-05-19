import { WebSocketServer } from 'ws';
import IBattleshipWebSocket from '../../types/battleshipWebSocket.types';
import { resType, dataCreateGame, dataStartGame, dataTurn, dataShoot, dataFinish } from '../../types/res.types';
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
        playerTurn: !isFirstPlayer,
    };

    games.push(playerGame);

    const gamePlayers: game[] = games.filter(game => game.gameId === gameId);

    if (gamePlayers.length > 1) {
        wss.clients.forEach(client => {
            const clientBS = client as IBattleshipWebSocket;

            if (clientBS.readyState !== clientBS.OPEN) {
                return;
            }

            const clientGame = gamePlayers.find(game => game.playerIndex === clientBS.playerIndex);

            if (!clientGame) {
                return;
            }

            const ships = clientGame?.ships || [];
            const dataString: dataStartGame = {
                ships,
                currentPlayerIndex: readyPlayer.indexPlayer,
            };

            client.send(JSON.stringify(preparingRes(resType.start_game, dataString, id)));

            turn(clientBS, readyPlayer.indexPlayer, id);
        });
    }
}

function turn(ws: IBattleshipWebSocket, playerId: string, id: number) {
    const dataString: dataTurn = {
        currentPlayer: playerId,
    };

    ws.send(JSON.stringify(preparingRes(resType.turn, dataString, id)));
}

function shoot(
    wss: WebSocketServer,
    ws: IBattleshipWebSocket,
    attack: { gameId: string; x: number; y: number; indexPlayer: string },
    id: number
) {
    const { gameId, x, y, indexPlayer } = attack;

    const gameSessions = games.filter(game => game.gameId === gameId);

    const enemyGame = gameSessions.find(game => game.playerIndex !== ws.playerIndex);

    if (!enemyGame) {
        return;
    }

    const gameDefendingPlayerIndex = enemyGame.playerIndex;

    const alreadyShot = enemyGame.shots.some(pos => pos.x === x && pos.y === y);

    if (alreadyShot) {
        return;
    }

    const hitShip = enemyGame.ships.find(ship => isShipHit(ship, x, y));

    if (hitShip) {
        hitShip.stamina = (hitShip.stamina || 0) - 1;
    }

    const isKilled = hitShip?.stamina === 0;
    const resultAttack = hitShip ? (isKilled ? 'killed' : 'shot') : 'miss';

    if (isKilled) {
        for (let i = 0; i < hitShip.length; i++) {
            const shipX = hitShip.direction ? hitShip.position.x : hitShip.position.x + i;
            const shipY = hitShip.direction ? hitShip.position.y + i : hitShip.position.y;

            const existingShot = enemyGame.shots.find(shot => shot.x === shipX && shot.y === shipY);
            if (existingShot) {
                existingShot.result = 'killed';
            } else {
                enemyGame.shots.push({
                    x: shipX,
                    y: shipY,
                    result: 'killed',
                });
            }

            const killedDataString: dataShoot = {
                currentPlayer: indexPlayer,
                position: {
                    x: shipX,
                    y: shipY,
                },
                status: 'killed',
            };

            wss.clients.forEach(client => {
                const clientBS = client as IBattleshipWebSocket;
                if (clientBS.readyState === clientBS.OPEN) {
                    clientBS.send(JSON.stringify(preparingRes(resType.attack, killedDataString, id)));
                }
            });
        }

        const aroundCells = cellsAround(hitShip);
        aroundCells.forEach(cell => {
            if (!enemyGame.shots.some(shot => shot.x === cell.x && shot.y === cell.y)) {
                enemyGame.shots.push({
                    x: cell.x,
                    y: cell.y,
                    result: 'miss',
                });

                const missDataString: dataShoot = {
                    currentPlayer: indexPlayer,
                    position: {
                        x: cell.x,
                        y: cell.y,
                    },
                    status: 'miss',
                };

                wss.clients.forEach(client => {
                    const clientBS = client as IBattleshipWebSocket;
                    if (clientBS.readyState === clientBS.OPEN) {
                        clientBS.send(JSON.stringify(preparingRes(resType.attack, missDataString, id)));
                    }
                });
            }
        });
    } else {
        enemyGame.shots.push({
            x,
            y,
            result: resultAttack,
        });

        const dataString: dataShoot = {
            currentPlayer: indexPlayer,
            position: {
                x,
                y,
            },
            status: resultAttack,
        };

        wss.clients.forEach(client => {
            const clientBS = client as IBattleshipWebSocket;
            if (clientBS.readyState === clientBS.OPEN) {
                clientBS.send(JSON.stringify(preparingRes(resType.attack, dataString, id)));
            }
        });
    }

    const nextTurn = resultAttack === 'miss' ? gameDefendingPlayerIndex : indexPlayer;
    wss.clients.forEach(client => {
        const clientBS = client as IBattleshipWebSocket;
        if (clientBS.readyState === clientBS.OPEN) {
            turn(clientBS, nextTurn, id);
        }
    });

    const isAllKilled = enemyGame.ships.every(ship => ship.stamina === 0);

    if (isAllKilled) {
        const dataString: dataFinish = {
            winPlayer: indexPlayer,
        };

        wss.clients.forEach(client => {
            const clientBS = client as IBattleshipWebSocket;
            if (clientBS.readyState === clientBS.OPEN) {
                clientBS.send(JSON.stringify(preparingRes(resType.finish, dataString, id)));
            }
        });
    }
}

function cellsAround(ship: ship): { x: number; y: number }[] {
    const {
        position: { x, y },
        length,
        direction,
    } = ship;
    const [dx, dy] = direction ? [0, 1] : [1, 0];
    const around: { x: number; y: number }[] = [];

    around.push({ x: x - dx, y: y - dy }, { x: x + dx * length, y: y + dy * length });

    for (let i = -1; i < length + 1; ++i) {
        around.push({ x: x - dy + i * dx, y: y - dx + i * dy }, { x: x + dy + i * dx, y: y + dx + i * dy });
    }

    return around.filter(({ x, y }) => 0 <= x && x < 10 && 0 <= y && y < 10);
}

function randomAttack(
    wss: WebSocketServer,
    ws: IBattleshipWebSocket,
    random: { gameId: string; indexPlayer: string },
    id: number
) {
    const { gameId, indexPlayer } = random;

    const currentGames = games.filter(game => game.gameId === gameId);

    if (!currentGames) {
        return;
    }

    const enemyGame = currentGames.find(game => game.playerIndex !== ws.playerIndex);

    if (!enemyGame) {
        return;
    }

    const allCells: { x: number; y: number }[] = [];

    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            allCells.push({ x, y });
        }
    }

    const availableCells = allCells.filter(c => !enemyGame.shots.some(s => s.x === c.x && s.y === c.y));

    if (!availableCells) {
        return;
    }

    const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];

    shoot(wss, ws, { gameId, x: randomCell.x, y: randomCell.y, indexPlayer }, id);
}

function isShipHit(ship: ship, x: number, y: number): boolean {
    const { position, direction, length } = ship;

    if (direction) {
        return x === position.x && y >= position.y && y < position.y + length;
    } else {
        return y === position.y && x >= position.x && x < position.x + length;
    }
}

export { createGame, joinGame, startGame, shoot, randomAttack };
