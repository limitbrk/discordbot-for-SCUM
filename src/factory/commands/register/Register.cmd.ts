import { ButtonInteraction, CacheType, channelMention, CommandInteraction, ComponentType, InteractionCollector, InteractionReplyOptions, ModalSubmitInteraction, SlashCommandBuilder } from 'discord.js';
import { t } from 'i18next';
import config from '../../../Config';
import { RegisterMsg } from './message/RegisterMsg';
import { ErrorCode } from '../../../constant/ErrorCode';
import { SteamProfile, CommandError } from '../../../model';
import { ApplicationFactory } from '../..';

const regTime: number = config.SETTING.REGISTER.WAITTIME
const rulecode: string = config.SETTING.REGISTER.RULE_CODE
const rules: Record<string, string> = {
	th: config.SETTING.REGISTER.RULES.TH.map((id:any) => channelMention(id)).join('\n'),
	en: config.SETTING.REGISTER.RULES.EN.map((id:any) => channelMention(id)).join('\n'),
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription(t("command.help")),
	async execute(app: ApplicationFactory, interaction: CommandInteraction) {
		const filter = (i: any) => i.user.id === interaction.user.id;
		let txnLang = "en";
		let steamProfile : SteamProfile;
		
		interaction.reply(RegisterMsg.init()).then( i => i.awaitMessageComponent({filter, componentType: ComponentType.Button, time: regTime}))
			// STEP 1 : Read Rule
			.then( i => {txnLang = i.customId; return i.deferUpdate();})
			.then( i => i.edit(RegisterMsg.step1(txnLang, rules[txnLang])))
			.then( i => {
				// STEP 2 : Type Info on Modal
				return new Promise((resolve, reject)=>{
					const modalCollector = i.createMessageComponentCollector({filter, componentType: ComponentType.Button, time: regTime})
					let initedAwaitModal = false;
					modalCollector.on("collect", i => {
						if(['step1.btn.next','step3.btn.back'].includes(i.customId)){
							i.showModal(RegisterMsg.step2(txnLang))
							if(!initedAwaitModal){
								initedAwaitModal = true;
								i.awaitModalSubmit({filter, time: regTime}).then( i => {
									// Validate
									const id = i.fields.getTextInputValue("step2.question1")
									const rc = i.fields.getTextInputValue("step2.question2")
									i.deferUpdate().then( async i => {
										if (rc !== rulecode){
											return reject(new CommandError(ErrorCode.INVALID_RULECODE));
										}
										try {
											steamProfile = await app.steamProfileRepo.getPlayerByID64(id)
										} catch (e) {
											reject(e)
										}
										initedAwaitModal = false;
										i.edit(RegisterMsg.step3(txnLang, steamProfile)).catch( e => reject(e))
									});
								})
							}
						} else if (i.customId === "step3.btn.next") {
							modalCollector.stop("success");
							interaction.deleteReply();
							interaction.channel?.send(RegisterMsg.finish(txnLang, i.user, steamProfile));
						} else {
							reject("No Custom ID Found")
						}
					})

					modalCollector.on("end", (collected, reason) => {
						if (reason !== "time" && reason !== "success" ) {
							console.log("got Error inside end")
							reject(new Error(reason));
						}
					});
				})
			})
			.catch((err: CommandError | Error) => {
				console.log("got Error outside")
				if(!interaction.deferred && !interaction.replied){
					interaction.deferReply();
				}
				if(err instanceof CommandError) {
					interaction.editReply(err.getDiscordMessage(txnLang))
				} else {
					console.log(err);
					interaction.editReply(new CommandError(err.message).getDiscordMessage(txnLang))
				}
			})
	},
};
