type attack = {
    position: {
        x: number;
        y: number;
    };
    length: number;
    type: 'miss'|'killed'|'shot';
};

export default attack;
