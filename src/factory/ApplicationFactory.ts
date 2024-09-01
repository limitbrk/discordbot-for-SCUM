import { SteamProfileRepositoryImpl } from "../repository/impl/SteamProfileRepositoryImpl";
import { SteamProfileRepository } from "../repository/SteamProfileRepository";

export class ApplicationFactory{
    public steamProfileRepo : SteamProfileRepository

    constructor(
        config: any
    ){
        this.steamProfileRepo = new SteamProfileRepositoryImpl(config.REPO.STEAM.TOKEN)
    }
}