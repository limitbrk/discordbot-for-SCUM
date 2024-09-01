import { Client, Events, GatewayIntentBits } from "discord.js";
import config from "./Config";
import { ApplicationFactory, CommandFactory, LocaleFactory } from "./factory";

LocaleFactory.load();

const app = new ApplicationFactory(config);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient: any) => {
	console.log(`Ready! Logged in as "${readyClient.user.tag}"`);
});

const commands = new CommandFactory(app);
commands.listenInteraction(client);

client.login(config.DISCORD.TOKEN);