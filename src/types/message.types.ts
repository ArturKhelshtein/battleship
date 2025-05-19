type message = {
    type: string;
    data: string;
    id: number;
};

enum typeIncomingMessage {
    'reg',
    'create_room',
    'add_user_to_room',
    'add_ships',
    'attack',
    'randomAttack',
}

export default message;
