import { SteamProfile } from "../model/SteamProfile";

export interface SteamProfileRepository {
    getPlayerByID64(id :string): Promise<SteamProfile>
}