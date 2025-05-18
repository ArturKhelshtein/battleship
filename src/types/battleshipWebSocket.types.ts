import WebSocket from 'ws';

interface IBattleshipWebSocket extends WebSocket {
    playerIndex: string;
    playerName: string;
}

export default IBattleshipWebSocket;