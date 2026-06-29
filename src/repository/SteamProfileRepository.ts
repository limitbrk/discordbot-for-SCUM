import { SteamProfile } from "../model/SteamProfile";

export interface SteamProfileRepository {
    getByID64(id :string): Promise<SteamProfile|undefined>
}