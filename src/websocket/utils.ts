import { resType } from "../types/res.types";

function preparingRes(type: resType, data: any, id: number) {
    return {
        type,
        data: JSON.stringify(data),
    };
}

export { preparingRes };
