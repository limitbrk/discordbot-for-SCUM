import { ErrorCode } from "../../constant/ErrorCode"
import { SteamProfile, CommandError } from "../../model"

export class SteamProfileRepositoryImpl {
    constructor(
        private token: string
    ){}

    public getPlayerByID64(id :string): Promise<SteamProfile>{
        return fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${this.token}&steamids=${id}`,{
            method: 'GET',
        })
        .then((rs) => rs.json())
        .then((rs: any) => {
            if (rs.response.players.length<1){
                throw new CommandError(ErrorCode.INVALID_STEAMID)
            }
            return rs.response.players[0] as SteamProfile
        }).then((data)=>{
            data.profileUrl = `https://steamcommunity.com/profiles/${id}`
            return data
        })
    }
}
