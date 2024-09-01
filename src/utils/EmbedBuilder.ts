import { EmbedBuilder, User, userMention } from 'discord.js';
import { Color } from '../constant/Color';
import { SteamProfile } from '../model';

export class EmbedBuilderUtil {

    static info(title: string, desc?: string, color?: Color): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc || null)
            .setColor(color || Color.PINK);
    }

    static steamInfo(title: string, desc: string, steamInfo: SteamProfile): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(Color.BLUE_STEAM)
            .setThumbnail(steamInfo.avatarfull)
            .addFields(
                { name: "Steam Profile", value: `[${steamInfo.personaname}](${steamInfo.profileUrl})`},
                { name: "SteamID64 (Dec)", value: steamInfo.steamid}
            );
    }

    static playerInfo(title: string, desc: string, user: User, steamInfo: SteamProfile): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc || null)
            .setColor(Color.PINK)
            .setThumbnail(user.avatarURL())
            .addFields(
                { name: "Discord", value: userMention(user.id)},
                { name: "Steam Profile", value: `[${steamInfo.personaname}](${steamInfo.profileUrl})`},
                { name: "SteamID64 (Dec)", value: steamInfo.steamid}
            );
    }

    static error(title: string, desc: string = "This is a internal Error", footer: string= "Please contact admin. If any defect"): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle("Happy Bot")
            .addFields({ name: title, value: desc, inline: false })
            .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Error.svg/1200px-Error.svg.png")
            .setFooter({ text: footer })
            .setColor(Color.RED);
    }
}
