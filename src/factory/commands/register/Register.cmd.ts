import { CacheType, channelMention, CommandInteraction, ComponentType, ModalSubmitInteraction, SlashCommandBuilder } from 'discord.js';
import { t } from 'i18next';
import config from '../../../Config';
import { RegisterMsg } from './message/RegisterMsg';
import { ApplicationFactory } from '../../ApplicationFactory';
import { ErrorCode } from '../../../constant/ErrorCode';
import { SteamProfile, CommandError } from '../../../model';

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
			// STEP 1
			.then( i => {txnLang = i.customId; return i.deferUpdate();})
			.then( i => i.edit(RegisterMsg.step1(txnLang, rules[txnLang])))
			.then( i => {
				// STEP 2
				return new Promise<ModalSubmitInteraction<CacheType>>((resolve, reject)=>{
					const collector = i.createMessageComponentCollector({filter, componentType: ComponentType.Button, time: regTime})
					collector.on("collect", i => {
						i.showModal(RegisterMsg.step2(txnLang)).then(() =>
							i.awaitModalSubmit({filter, time: regTime}).then(i => {
								collector.stop("success")
								resolve(i)
							})
						);
						
					})

					collector.on("end", (collected, reason) => {
						if (reason !== "time" && reason !== "success" ) {
							reject(new Error(reason));
						}
					});
				})
			})
			.then( i => { 
				const replyI = i.deferUpdate()
				const id = i.fields.getTextInputValue("step2.question1")
				const rc = i.fields.getTextInputValue("step2.question2")
				if (rc !== rulecode){
					return Promise.reject(new CommandError(ErrorCode.INVALID_RULECODE))
				}
				return app.steamProfileRepo.getPlayerByID64(id).then((profile) => {
					steamProfile = profile;
					return replyI;
				},(err)=> {console.log("THIS THROW?");throw err})
			})
			// Step 3 
			.then( i => i.edit(RegisterMsg.step3(txnLang, steamProfile)))
			.then( i => i.awaitMessageComponent({filter, componentType: ComponentType.Button, time: regTime}))
			.then( i => {
				if (i.customId === "step3.btn.next"){
					interaction.deleteReply();
					interaction.channel?.send(RegisterMsg.finish(txnLang, i.user, steamProfile));
				} else if(i.customId === "step3.btn.back") {
					// Go back to step2
					
				}
			})
			.catch((err: CommandError | Error) => {
				if(err instanceof CommandError) {
					interaction.editReply(err.getDiscordMessage())
				} else {
					console.log(err);
					interaction.editReply(new CommandError(err.message).getDiscordMessage())
				}
			})
	},
};
