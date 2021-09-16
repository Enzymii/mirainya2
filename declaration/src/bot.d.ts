export interface BotConfig {
    qq: number;
    verifyKey: string;
    host?: string;
    post?: number;
    enableWebSocket?: boolean;
}
export default class Bot {
    qq: number;
    key: string;
    constructor(config: BotConfig);
}
