import { IPlayer } from "./player.types";

type room = {
    index: string;
    usersId: string[];
    isPrivate?: boolean;
};

type updateRoom = {
    roomId: string;
    roomUsers: IPlayer[];
}

export { room, updateRoom };
