import { EmbedBuilder, User } from 'discord.js';

export class EmbedBuilderUtil {
    static steamInfo(title: string, steamInfo: { [key: string]: string }) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(0x2a475e)
            .setThumbnail(steamInfo["avatar"])
            .addFields([
                { name: "Profile", value: `[${steamInfo['name']}](${steamInfo['url']})`, inline: false },
                { name: "SteamID64 (Dec)", value: steamInfo["id"], inline: false }
            ]);
        return embed;
    }

    static registerDesc(title: string, desc: string | null = null) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(0xfe9ab8)
            .setDescription(desc || '');
        return embed;
    }

    static registerInfo(title: string, desc: string, discordUser: User, steamInfo: { [key: string]: string }) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(0xffac1c)
            .setDescription(desc)
            .setThumbnail(discordUser.displayAvatarURL({ extension: 'png', size: 1024 }))
            .addFields([
                { name: "Discord Name", value: discordUser.toString(), inline: false },
                { name: "Steam Profile", value: `[${steamInfo['name']}]({steamInfo['url']})`, inline: false },
                { name: "SteamID64 (Dec)", value: steamInfo["id"], inline: false }
            ]);
        return embed;
    }

    static error(err: string) {
        const embed = new EmbedBuilder()
            .setColor(0xfe9ab8)
            .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Error.svg/1200px-Error.svg.png")
            .addFields({ name: "Happy Bot", value: err, inline: false })
            .setFooter({ text: "กรุณาติดต่อแอดมิน กรณีที่ทำรายการไม่ถูกต้อง" });
        return embed;
    }
}
