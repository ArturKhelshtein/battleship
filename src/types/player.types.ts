interface IPlayer {
    name: string;
    index: string;
}

interface IPlayerWithPassword extends IPlayer {
    password: string;
}

export { IPlayerWithPassword, IPlayer };
