import { Client, Events, GatewayIntentBits } from "discord.js";
import config from "./Config";
import { CommandFactory, LocaleFactory } from "./factory";
import { ApplicationFactory } from "./factory/ApplicationFactory";

LocaleFactory.load();

const app = new ApplicationFactory(config);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient: any) => {
	console.log(`Ready! Logged in as "${readyClient.user.tag}"`);
});

const commands = new CommandFactory(app);
commands.listenInteraction(client);

client.login(config.DISCORD.TOKEN);