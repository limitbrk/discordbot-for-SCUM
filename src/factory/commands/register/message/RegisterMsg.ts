import { ActionRowBuilder, BaseMessageOptions, ButtonBuilder, ButtonStyle, channelMention, InteractionEditReplyOptions, InteractionReplyOptions, MessageFlags, MessageFlagsBitField, ModalComponentData, TextInputBuilder, TextInputStyle, User, userMention } from "discord.js";
import { getFixedT } from "i18next";
import config from "../../../../config";
import { SteamProfile } from "../../../../model";
import { EmbedBuilderUtil, StringUtils } from "../../../../utils";

export class RegisterMsg {
    private static readonly namespace: string = "register"; // Define the namespace
    private static readonly roomCh: string[] = config.SETTING.REGISTER.STARTER_ROOM.map((id:any) => channelMention(id))

    public static init(): InteractionReplyOptions {
        const _ = getFixedT(null, this.namespace);

        return {
            embeds: [EmbedBuilderUtil.info(_("command.title"))],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('th')
                    .setLabel(_('command.btn.th.text'))
                    .setEmoji(_('command.btn.th.emoji'))
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('en')
                    .setLabel(_('command.btn.en.text'))
                    .setEmoji(_('command.btn.en.emoji'))
                    .setStyle(ButtonStyle.Primary),
            )],
            flags: MessageFlags.Ephemeral,
        }
    }
    public static step1(lang: string, rule: string): InteractionEditReplyOptions {
        const _ = getFixedT(lang, this.namespace);
        return {
            embeds: [EmbedBuilderUtil.info(
                _("step1.title"),
                StringUtils.format(
                    _("step1.desc"), 
                    rule,
                    _('step1.btn.next.emoji'),
                    _('step1.btn.next.text'),
                )
            )],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('step1.btn.next')
                    .setLabel(_('step1.btn.next.text'))
                    .setEmoji(_('step1.btn.next.emoji'))
                    .setStyle(ButtonStyle.Success),
            )],
        }
    }
    public static step2(lang: string, ): ModalComponentData {
        const _ = getFixedT(lang, this.namespace);
        return {
            customId:'step2',
            title: _('step2.title'),
            components: [
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('step2.question1')
                        .setLabel(_('step2.question1.label'))
                        .setPlaceholder(_('step2.question1.placeholder'))
                        .setMaxLength(17)
                        .setMinLength(17)
                        .setStyle(TextInputStyle.Short)),
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('step2.question2')
                        .setLabel(_('step2.question2.label'))
                        .setPlaceholder(_('step2.question2.placeholder'))
                        .setMaxLength(4)
                        .setMinLength(4)
                        .setStyle(TextInputStyle.Short)),
            ],
        }
    }
    public static step3(lang: string, steam: SteamProfile): InteractionEditReplyOptions {
        const _ = getFixedT(lang, this.namespace);
        return {
            embeds: [EmbedBuilderUtil.steamInfo(
                _("step3.title"),
                _("step3.desc"),
                steam,
            )],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('step3.btn.back')
                    .setLabel(_('step3.btn.back.text'))
                    .setEmoji(_('step3.btn.back.emoji'))
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('step3.btn.next')
                    .setLabel(_('step3.btn.next.text'))
                    .setEmoji(_('step3.btn.next.emoji'))
                    .setStyle(ButtonStyle.Success),
            )],
        }
    }
    public static finish(lang: string, user: User, steam: SteamProfile): BaseMessageOptions {
        const _ = getFixedT(lang, this.namespace);
        return {
            content: StringUtils.format(_("finish.msg"), userMention(user.id)),
            embeds: [EmbedBuilderUtil.playerInfo(
                _("finish.title"),
                StringUtils.format(_("finish.desc"), ...this.roomCh),
                user,
                steam,
            )],
            components: []
        }
    }
}