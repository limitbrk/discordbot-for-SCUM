import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, Interaction, REST, Routes } from 'discord.js';
import { ApplicationFactory } from './ApplicationFactory';
import { logger } from '../Logger';

export class CommandFactory{
	private commands : Collection<string, any>;

	constructor(private app : ApplicationFactory, config: any) {
		this.commands = new Collection();
		this.loadCommands();
		this.syncCommands(config.DISCORD.TOKEN, config.DISCORD.CLIENT_ID);
	}

	private loadCommands(){
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
					logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}
	}

	public syncCommands(token: string, id: string) {
        const rest = new REST({ version: '10' }).setToken(token);
        const commandsArray = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());
        try {
            rest.put(
                Routes.applicationCommands(id),
                { body: commandsArray }
            );
            logger.info(`Successfully reloaded ${commandsArray.length} application (/) commands.`);
        } catch (error) {
            logger.error('Error reloading application (/) commands:', error);
        }
    }

	public async listenInteraction(client: Client<boolean>) {
		client.on(Events.InteractionCreate, async (interaction: Interaction) => {
			if (!interaction.isChatInputCommand()) return;
			const command = this.commands.get(interaction.commandName);
		
			if (!command) {
				logger.error(`No command ${interaction.commandName}.`);
				return;
			}
		
			try {
				logger.info(`"@${interaction.user.tag}" executed: ${interaction.commandName}`)
				await command.execute(this.app, interaction);
			} catch (error) {
				logger.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		});
	}
}
