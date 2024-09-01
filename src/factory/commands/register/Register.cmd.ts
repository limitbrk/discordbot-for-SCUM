import { channelMention, CommandInteraction, ComponentType, InteractionReplyOptions, Message, SlashCommandBuilder } from 'discord.js';
import { t } from 'i18next';
import config from '../../../Config';
import { RegisterMsg } from './message/RegisterMsg';
import { ErrorCode } from '../../../constant/ErrorCode';
import { SteamProfile, CommandError } from '../../../model';
import { ApplicationFactory } from '../..';
import { logger } from '../../../Logger';

const regTime: number = config.SETTING.REGISTER.WAITTIME;
const rulecode: string = config.SETTING.REGISTER.RULE_CODE;
const rules: Record<string, string> = {
	th: config.SETTING.REGISTER.RULES.TH.map((id: any) => channelMention(id)).join('\n'),
	en: config.SETTING.REGISTER.RULES.EN.map((id: any) => channelMention(id)).join('\n'),
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription(t("command.help")),
	
	async execute(app: ApplicationFactory, interaction: CommandInteraction) {
		try {
			const filter = (i: any) => i.user.id === interaction.user.id;

			// STEP 0: Initial Reply
			const initinteraction = await interaction.reply(RegisterMsg.init())
				.then(i => i.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: regTime }));

			// STEP 1: Handle Rule Accept
			const txnLang = initinteraction.customId;
			await initinteraction.deferUpdate();
			const buttonInteraction = await initinteraction.editReply(RegisterMsg.step1(txnLang, rules[txnLang]));

			// STEP 2-3: STEAMID Validate
			const steamProfile = await handleModalInteraction(app, interaction, buttonInteraction, txnLang);

			// STEP 4: Finish Registration
			await interaction.deleteReply();
			await interaction.channel?.send(RegisterMsg.finish(txnLang, interaction.user, steamProfile));
			
		} catch (err: any) {
			await handleCommandError(interaction, err, "en");
		}
	},
};

async function handleModalInteraction(
	app: ApplicationFactory,
	interaction: CommandInteraction,
	buttonInteraction: Message<boolean>,
	txnLang: string
): Promise<SteamProfile> {
	return new Promise<SteamProfile>((resolve, reject) => {
		const filter = (i: any) => i.user.id === interaction.user.id;
		let steamProfile: SteamProfile;
		let initedAwaitModal = false;

		const modalCollector = buttonInteraction.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: regTime });

		modalCollector.on("collect", async i => {
			try {
				if (['step1.btn.next', 'step3.btn.back'].includes(i.customId)) {
					await i.showModal(RegisterMsg.step2(txnLang));
					if (!initedAwaitModal) {
						initedAwaitModal = true;
						const modalSubmit = await i.awaitModalSubmit({ filter, time: regTime });
						await modalSubmit.deferUpdate();

						const id = modalSubmit.fields.getTextInputValue("step2.question1");
						const rc = modalSubmit.fields.getTextInputValue("step2.question2");

						if (rc !== rulecode) {
							throw new CommandError(ErrorCode.INVALID_RULECODE);
						}

						steamProfile = await app.steamProfileRepo.getByID64(id);
						initedAwaitModal = false;
						await modalSubmit.editReply(RegisterMsg.step3(txnLang, steamProfile));
					}
				} else if (i.customId === "step3.btn.next") {
					modalCollector.stop("success");
					resolve(steamProfile);
				} else {
					throw new CommandError("No Custom ID Found");
				}
			} catch (err: any) {
				modalCollector.stop(err.message);
			}
		});

		modalCollector.on("end", async (collected, reason) => {
			if (!["success"].includes(reason)) {
				reject(new Error(reason));
			}
		});
	});
}


async function handleCommandError(interaction: CommandInteraction, err: CommandError | Error, lang: string) {

	if (!interaction.deferred && !interaction.replied) {
		await interaction.deferReply();
	}

	let message :InteractionReplyOptions;
	if (err.message === 'time') {
		logger.debug("timeout:", err);
		return;
	} else if (err instanceof CommandError) {
		logger.debug("User Error:", err);
		message = err.getDiscordMessage(lang)
	} else {
		logger.info("Unexpected error:", err);
		message = new CommandError(err.message).getDiscordMessage(lang);
	}

	await interaction.editReply(message).catch(logger.error);
}
