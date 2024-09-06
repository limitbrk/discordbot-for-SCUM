import { channelMention, CommandInteraction, ComponentType, Message, SlashCommandBuilder } from 'discord.js';
import { t } from 'i18next';
import config from '../../../config';
import { RegisterMsg } from './message/RegisterMsg';
import { ErrorCode } from '../../../constant/ErrorCode';
import { SteamProfile, CommandError } from '../../../model';
import { ApplicationFactory } from '../..';

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
		.setDescription(t("command.help", {ns: "register"})),
	
	async execute(app: ApplicationFactory, interaction: CommandInteraction) {
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
		interaction.guild?.members.fetch(interaction.user.id).then(member =>
			member.roles.add(roles[txnLang])
		)
		await interaction.channel?.send(RegisterMsg.finish(txnLang, interaction.user, steamProfile));
		await interaction.deleteReply();
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
						try{
							const id = modalSubmit.fields.getTextInputValue("step2.question1");
							const rc = modalSubmit.fields.getTextInputValue("step2.question2");

							if (rc !== rulecode) {
								throw new CommandError(ErrorCode.INVALID_RULECODE);
							}
							steamProfile = await app.steamProfileRepo.getByID64(id);
							initedAwaitModal = false;
							await modalSubmit.deferUpdate();
							await modalSubmit.editReply(RegisterMsg.step3(txnLang, steamProfile));
						} catch (e) {
							await modalSubmit.deferUpdate();
							throw e;
						}
						
					}
				} else if (i.customId === "step3.btn.next") {
					modalCollector.stop("success");
					resolve(steamProfile);
				} else {
					throw new Error("Internal: CustomID not found");
				}
			} catch (err: any) {
				modalCollector.stop(err.message);
			}
		});

		modalCollector.on("end", async (collected, reason) => {
			if (!["success"].includes(reason)) {
				reject(new CommandError(reason, txnLang));
			}
		});
	});
}

