import { ButtonInteraction, channelMention, CommandInteraction, ComponentType, SlashCommandBuilder, TextChannel } from 'discord.js';
import { t } from 'i18next';
import config from '../../../config';
import { RegisterMsg } from './message/RegisterMsg';
import { ErrorCode } from '../../../constant/ErrorCode';
import { SteamProfile, CommandError } from '../../../model';
import { ApplicationFactory } from '../..';
import { DiscordUtils } from '../../../utils';
import { SteamProfileRepository } from '../../../repository/SteamProfileRepository';

const regTime: number = config.SETTING.REGISTER.WAITTIME;
const rulecode: string = config.SETTING.REGISTER.RULE_CODE;
const rules: Record<string, string> = {
  th: config.SETTING.REGISTER.RULES.TH.map((id: any) => channelMention(id)).join('\n'),
  en: config.SETTING.REGISTER.RULES.EN.map((id: any) => channelMention(id)).join('\n'),
};
const roles: Record<string, string[]> = {
  th: config.SETTING.REGISTER.ASSIGN_ROLES.TH,
  en: config.SETTING.REGISTER.ASSIGN_ROLES.EN,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription(t("command.help", { ns: "register" })),

  async execute(app: ApplicationFactory, interaction: CommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true }); // Defer to allow time for interaction processing
      const lang = await step0_initial(interaction);
      await step1_rules(interaction, lang);
      const steamProfile = await step2_modal(app.steamProfileRepo, interaction, lang);
      await step3_confirm(interaction, lang, steamProfile);
      await step4_complete(interaction, lang, steamProfile);
    } catch (err) {
      throw err instanceof Error ? err : new CommandError('Unexpected error');
    }
  }
};

async function step0_initial(interaction: CommandInteraction): Promise<'th' | 'en'> {
  const reply = await interaction.editReply(RegisterMsg.init());
  const button = await reply.awaitMessageComponent({
    filter: i => i.user.id === interaction.user.id,
    componentType: ComponentType.Button,
    time: regTime,
  }) as ButtonInteraction;

  const lang = button.customId as 'th' | 'en';
  await DiscordUtils.safeDefer(button);
  return lang;
}

async function step1_rules(interaction: CommandInteraction, lang: 'th' | 'en') {
  const message = RegisterMsg.step1(lang, rules[lang]);
  await interaction.editReply(message);
}

async function step2_modal(
  steamProfileRepo: SteamProfileRepository,
  interaction: CommandInteraction,
  lang: 'th' | 'en',
): Promise<SteamProfile> {
  return new Promise(async (resolve, reject) => {
    let steamProfile: SteamProfile | undefined;
    let modalActive = false;

    const message = await interaction.fetchReply()
    const collector = message?.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      componentType: ComponentType.Button,
      time: regTime,
    });

    collector.on('collect', async i => {
      try {
        if (['step1.btn.next', 'step3.btn.back'].includes(i.customId)) {
          await i.showModal(RegisterMsg.step2(lang));

          if (!modalActive) {
            modalActive = true;

            const modal = await i.awaitModalSubmit({
              filter: m => m.user.id === interaction.user.id,
              time: regTime,
            });

            const id = modal.fields.getTextInputValue('step2.question1');
            const rc = modal.fields.getTextInputValue('step2.question2');
            if (rc !== rulecode) {
              await DiscordUtils.safeDefer(modal);
              return reject(new CommandError(ErrorCode.INVALID_RULECODE, lang));
            }

            steamProfile = await steamProfileRepo.getByID64(id);
            if (!steamProfile) {
              await DiscordUtils.safeDefer(modal);
              return reject(new CommandError(ErrorCode.INVALID_STEAMID, lang));
            }
            await DiscordUtils.safeDefer(modal);
            await modal.editReply(RegisterMsg.step3(lang, steamProfile));
          }
        } else if (i.customId === 'step3.btn.next') {
          collector.stop('success');
          resolve(steamProfile!);
        } else {
          throw new Error('Invalid Discord Custom ID');
        }
      } catch (e: any) {
        collector.stop(e.message);
        reject(new CommandError(e.message, lang));
      }
    });

    collector.on('end', (_, reason) => {
      if (!['success', 'time'].includes(reason)) {
        reject(new CommandError(reason, lang));
      }
    });
  });
}

async function step3_confirm(interaction: CommandInteraction, lang: 'th' | 'en', steam: SteamProfile) {
  await interaction.editReply(RegisterMsg.step3(lang, steam));
}

async function step4_complete(
  interaction: CommandInteraction,
  lang: 'th' | 'en',
  steam: SteamProfile,
) {
  const member = await interaction.guild?.members.fetch(interaction.user.id);
  await member?.roles.add(roles[lang]);

  const finishMsg = RegisterMsg.finish(lang, interaction.user, steam);
  await (interaction.channel as TextChannel).send(finishMsg);
  await interaction.deleteReply();
}

