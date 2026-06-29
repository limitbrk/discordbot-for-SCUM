export interface ServerInfo {
    id: string,
    name: string,
    ip: string,
    port: string,
    players: number,
    maxPlayers: number,
    rank: number,
    status: string,
    details: ServerDetail,
}

export interface ServerDetail {
    version: string,
    time: string,
}