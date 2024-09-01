import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, CommandInteraction, Events, Interaction, InteractionReplyOptions, REST, Routes } from 'discord.js';
import { ApplicationFactory } from './ApplicationFactory';
import { logger } from '../Logger';
import { CommandError } from '../model';

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
            ).then( () => {
				logger.info(`Successfully reloaded ${commandsArray.length} application (/) commands.`);
			});
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
				
				const logSuffix = `User @${interaction.user.tag}\t -> ${interaction.commandName}`;
				logger.info(`ENTERING: ${logSuffix}`);
				await command.execute(this.app, interaction);
				logger.info(`SUCCESS : ${logSuffix}`);
			} catch (error: any) {
				handleCommandError(interaction, error);
			}
		});
	}
}


async function handleCommandError(interaction: CommandInteraction, err: CommandError | Error) {
	let message :InteractionReplyOptions;
	const logSuffix = `User @${interaction.user.tag}\t -> ${interaction.commandName}`;
	if (err.message === 'time') {
		logger.debug(`TIME OUT: ${logSuffix} `, err);
		return;
	} else if (err instanceof CommandError) {
		logger.info (`FAILED  : ${logSuffix} `, err);
		message = err.getDiscordMessage()
	} else {
		logger.info (`ERROR   : ${logSuffix} `, err);
		message = new CommandError(err.message).getDiscordMessage();
	}

	if (!interaction.deferred && !interaction.replied) {
		await interaction.deferReply();
	}
	await interaction.editReply(message);
}
