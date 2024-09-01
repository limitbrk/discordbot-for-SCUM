import { Client, Events, GatewayIntentBits } from "discord.js";
import config from "./config";
import { ApplicationFactory, CommandFactory, LocaleFactory } from "./factory";
import { logger } from "./Logger";

// init Locale
LocaleFactory.load();

// Initialize Express application
const app = new ApplicationFactory(config);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient: Client<true>) => {
	logger.info(`Ready! Logged in as "${readyClient.user.tag}"`);

	// Function to set rich presence
    function updateRichPresence() {
		app.serverInfoRepo.getDiscordPresence().then(ps =>{
			readyClient.user.setPresence(ps);
			logger.info('updated: ' + ps.activities?.[0].name);
		})
    }
    updateRichPresence();
    setInterval(updateRichPresence, 60000);
});

const commands = new CommandFactory(app, config);
commands.listenInteraction(client);

client.login(config.DISCORD.TOKEN);