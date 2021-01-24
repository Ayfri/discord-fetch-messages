import * as Discord from 'discord.js';

declare module 'discord-fetch-messages' {
	/**
	 * Fetch all the messages from a Discord Guild.
	 * @param {module:"discord.js".Client} client - Your Discord.js Client.
	 * @param {string} guildID - The ID of the Guild to be fetch.
	 * @returns {Promise<module:"discord.js".Message[]>} - All the messages fetched.
	 */
	export function fetchGuildMessages(client: Discord.Client, guildID: Discord.Snowflake): Promise<Discord.Message[]>;
	/**
	 * Fetch all the messages from a Discord TextChannel.
	 * @param {module:"discord.js".Client} client - Your Discord.js Client.
	 * @param {module:"discord.js".TextChannel | module:"discord.js".NewsChannel} channel - The ID of the Discord TextChannel.
	 * @returns {Promise<module:"discord.js".Message[]>} - All the messages fetched.
	 */
	export function fetchChannelMessages(client: Discord.Client, channel: Discord.Channel): Promise<Discord.Message[]>;
}
