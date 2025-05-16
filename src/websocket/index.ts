import { WebSocketServer } from 'ws';

export function initWebSocketServer({ port, path }: { port: number; path: string }) {
    const wss = new WebSocketServer({ port: port, path: path });

    wss.on('connection', ws => {
        console.log(`WebSocket server on the ${port} port!`);
        ws.send('Hello from server');
    });
}
