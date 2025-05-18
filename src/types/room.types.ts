import { IPlayer } from "./player.types";

type room = {
    index: string;
    usersId: string[];
};

type updateRoom = {
    roomId: string;
    roomUsers: IPlayer[];
}

export { room, updateRoom };
