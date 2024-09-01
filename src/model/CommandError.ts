import { InteractionReplyOptions } from "discord.js";
import { EmbedBuilderUtil } from "../utils";
import { getFixedT } from "i18next";
import { ErrorCode } from "../constant/ErrorCode";

export class CommandError extends Error {
    public getDiscordMessage(lang:string = 'en'): InteractionReplyOptions{
        const _ = getFixedT(lang, "error");
        const message = this.isCommandError() ? _(this.message+".title") : this.message
        const desc = this.isCommandError() ? _(this.message+".desc") : _("core.errDesc")
        return {
            content: '',
            embeds: [EmbedBuilderUtil.error(message,desc,_("core.errFooter"))],
            components: [],
        }
    }

    public isCommandError(): boolean {
        return (<any> Object).values(ErrorCode).includes(this.message);
    }
}