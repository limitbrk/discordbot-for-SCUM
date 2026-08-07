import { ActivityType, PresenceData } from "discord.js";
import { ErrorCode } from "../../constant/ErrorCode";
import { ServerInfo } from "../../model";
import { ServerInfoRepository } from "../ServerInfoRepository";

enum APIType {
    BATTLEMETRICS = "BATTLEMETRICS",
    GGCON = "GGCON",
    RCON = "RCON",
}

export class ServerInfoRepositoryImpl implements ServerInfoRepository {
    private readonly apiType: APIType;
    constructor(
        private url: string,
        private headers: Record<string, string> = {}
    ){
        if (url.toLowerCase().includes('battlemetrics.com')) {
            this.apiType = APIType.BATTLEMETRICS;
        } else if (url.toLowerCase().includes('ggcon.gghost.games')) {
            this.apiType = APIType.GGCON;
        } else {
            throw new Error("Invalid server info url: " + url);
        }
    }

    private readonly clockEmoji   = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'];
    private readonly weatherEmoji = ['☀️', '🌙'];

    public get(): Promise<ServerInfo>{
        return fetch(this.url,{
            method: 'GET',
            headers: this.headers
        })
        .then(async (rs) => {
            let data: any = {};
            switch (rs.status) {
                case 200 :
                    data = await rs.json();
                    break;
                case 404 :
                    throw new Error(ErrorCode.INVALID_SERVERID);
                default :
                    throw new Error("Cannot get server info: " + rs.status + ": " + await rs.text());
            }
            switch (this.apiType) {
                case APIType.GGCON:
                    if (data.ok !== true) {
                        throw new Error("Cannot get server info: " + (data?.error || "Unknown error") + ": " + data?.reason);
                    }
                    return {
                        players: data.onlinePlayers,
                        maxPlayers: data.maxPlayers || 64,
                        status: data.online ? "online" : "offline",
                        details: {
                            time: `${data.timeOfDay}:00`
                        },
                    } as ServerInfo;
                default:
                    return data.attributes as ServerInfo;
            }
            
        })
    }

    public getDiscordPresence(): Promise<PresenceData> {
        return this.get().then((serverInfo) => {
            const { details, status, players, maxPlayers } = serverInfo;
            const hour = parseInt(details.time.split(':')[0], 10);
            const statusTime = `${this.clockEmoji[hour % 12]}${hour}`;
            const statusWeather = this.weatherEmoji[(hour > 5 && hour < 23) ? 0 : 1];
            return {
                status: status !== "online" ? "dnd" : players < 1 ? "idle" : "online",
                activities: [{
                    type: ActivityType.Playing,
                    name: `🏃${players}/${maxPlayers} ${statusTime}${statusWeather}`,
                    state: `Welcome to SCUM HappyLand Server!`,
                    timestamps: {
                        start: 1662447900000
                    },
                    // shardId: "canbe add later for large scaling (Idea 1 shard per 1 server)" 
                }]
            }
        })
    }
}
