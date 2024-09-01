import { ActivityType, PresenceData, PresenceStatusData } from "discord.js";
import { ErrorCode } from "../../constant/ErrorCode";
import { ServerInfo } from "../../model";
import { ServerInfoRepository } from "../ServerInfoRepository";

export class ServerInfoRepositoryImpl implements ServerInfoRepository {
    constructor(
        private id: string
    ){}

    private readonly clockEmoji   = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'];
    private readonly weatherEmoji = ['☀️', '🌙'];

    public get(): Promise<ServerInfo>{
        return fetch(`https://api.battlemetrics.com/servers/${this.id}`,{
            method: 'GET',
        })
        .then((rs) => {
            if (rs.status === 200) {
                return rs
            }
            throw new Error(ErrorCode.INVALID_SERVERID);
        })
        .then((rs) => rs.json())
        .then((rs: any) => rs.data.attributes as ServerInfo);
    }

    public getDiscordPresence(): Promise<PresenceData> {
        return this.get().then(({rank, status, players, maxPlayers, details}) => {
            const hour = parseInt(details.time.split(':')[0], 10);
            const statusTime = `${this.clockEmoji[hour % 12]}${hour}`;
            const statusWeather = this.weatherEmoji[(hour > 5 && hour < 23) ? 0 : 1];
            return {
                status: status !== "online" ? "dnd" : players < 1 ? "idle" : "online",
                activities: [{
                    type: ActivityType.Playing,
                    name: `🏃${players}/${maxPlayers} ${statusTime}${statusWeather}`,
                    state: `Now we're on #${rank} !!!`,
                    timestamps: {
                        start: 1662447900000
                    },
                    // shardId: "canbe add later for large scaling (Idea 1 shard per 1 server)" 
                }]
            }
        })
    }
}