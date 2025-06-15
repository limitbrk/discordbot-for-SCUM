import { InteractionReplyOptions, Message, MessagePayload, MessagePayloadOption } from "discord.js";
import { EmbedBuilderUtil } from "../utils";
import { getFixedT } from "i18next";
import { ErrorCode } from "../constant/ErrorCode";

export class CommandError extends Error {
    private discordMessage: MessagePayloadOption;

    constructor(message: string, lang: string = 'en'){
        super(message)
        const _ = getFixedT(lang, "error");
        const title = this.isCommandError() ? _(this.message+".title") : this.message
        const desc = this.isCommandError() ? _(this.message+".desc") : _("core.errDesc")
        this.discordMessage = {
            content: '',
            embeds: [EmbedBuilderUtil.error(title,desc,_("core.errFooter"))],
            components: [],
        };
    }

    public getDiscordMessage(): MessagePayloadOption{
        return this.discordMessage;
    }

    public isCommandError(): boolean {
        return (<any> Object).values(ErrorCode).includes(this.message);
    }
}