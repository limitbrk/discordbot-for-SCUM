import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, Interaction } from 'discord.js';
import { ApplicationFactory } from './ApplicationFactory';

export class CommandFactory{
	private commands : Collection<string, any>;

	constructor(private app : ApplicationFactory) {
		this.commands = new Collection();

		const foldersPath = path.join(__dirname, 'commands');
		const commandFolders = fs.readdirSync(foldersPath);

		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.match(/\.cmd\.(js|ts)$/));
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				const command = require(filePath);
				// Set a new item in the Collection with the key as the command name and the value as the exported module
				if ('data' in command && 'execute' in command) {
					this.commands.set(command.data.name, command);
				} else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}
	}

	public async listenInteraction(client: Client<boolean>) {
		client.on(Events.InteractionCreate, async (interaction: Interaction) => {
			if (!interaction.isChatInputCommand()) return;
			const command = this.commands.get(interaction.commandName);
		
			if (!command) {
				console.error(`No command ${interaction.commandName}.`);
				return;
			}
		
			try {
				console.log(`"@${interaction.user.tag}" executed: ${interaction.commandName}`)
				await command.execute(this.app, interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		});
	}
}
