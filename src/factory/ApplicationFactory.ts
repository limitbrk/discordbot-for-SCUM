import { ServerInfoRepositoryImpl } from "../repository/impl/ServerInfoRepositoryImpl";
import { SteamProfileRepositoryImpl } from "../repository/impl/SteamProfileRepositoryImpl";
import { ServerInfoRepository } from "../repository/ServerInfoRepository";
import { SteamProfileRepository } from "../repository/SteamProfileRepository";
import { TimeAlert } from "./job/TimedAlert";

export class ApplicationFactory{
    public timeTrackJob : TimeAlert

    public steamProfileRepo : SteamProfileRepository
    public serverInfoRepo : ServerInfoRepository

    constructor(
        config: any
    ){
        this.steamProfileRepo = new SteamProfileRepositoryImpl(config.REPO.STEAM.TOKEN)
        this.serverInfoRepo = new ServerInfoRepositoryImpl(config.SERVER.BATTLEMETRIC_ID)

        this.timeTrackJob = new TimeAlert(
            config.SETTING.EVENT.TIME_ALERT.CHANNEL,
            config.SETTING.EVENT.TIME_ALERT.ROLE,
        );

    }
}