import { PresenceData } from "discord.js";
import { ServerInfo } from "../model";

export interface ServerInfoRepository {
    get(): Promise<ServerInfo>
    getDiscordPresence(): Promise<PresenceData>
}