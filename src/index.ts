import { Client, Events, GatewayIntentBits } from "discord.js";
import config from "./config";
import { ApplicationFactory, CommandFactory, LocaleFactory } from "./factory";
import { logger } from "./Logger";
import { Router } from "./Router";

// Initialize Express application
const app = new ApplicationFactory(config);

// init Locale
LocaleFactory.load();

// init Route
Router.init(config.APP.PORT);

// init Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, (readyClient: Client<true>) => {
	logger.info(`Ready! Logged in as "${readyClient.user.tag}"`);

	// Function to set rich presence
    function updateRichPresence(isinit?: boolean) {
		app.serverInfoRepo.getDiscordPresence().then(ps =>{
			readyClient.user.setPresence(ps);
			const status = ps.activities?.[0].name
			logger.debug('updated: ' + status);
			if (status?.slice(-3,-2) !== undefined){
				app.timeTrackJob.checkTime(client, status?.slice(-3,-2))
			}
		}).catch( (e :Error) => {
			if (isinit) {
				throw e 
			}
			logger.error(e);
		})
    }
    updateRichPresence(true);
    setInterval(updateRichPresence, 60000);
});
const commands = new CommandFactory(app, config);
commands.listenInteraction(client);
client.login(config.DISCORD.TOKEN);