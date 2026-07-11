export interface ServerInfo {
    players: number,
    maxPlayers: number,
    status: string,
    details: ServerDetail,
}

export interface ServerDetail {
    time: string,
}