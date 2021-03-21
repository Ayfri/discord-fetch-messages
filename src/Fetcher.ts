import { Client, Message, Collection, Snowflake, TextChannel, Guild } from 'discord.js';
import { EventEmitter } from 'events';

/**
 * The main class used to fetch things.
 */
export class Fetcher extends EventEmitter {
	/**
	 * A simple property set to `true` when the Fetcher is fetching a bulk of messages, then set to false.
	 */
	public fetching: boolean;

	/**
	 * Creates a new Fetcher.
	 *
	 * @param client - Needs the client to fetch things.
	 */
	public constructor(public readonly client: Client) {
		super();
		this.fetching = false;
	}

	/**
	 * Fetch the entire list of messages from a channel, can be long and makes you have rateLimits.
	 *
	 * @param channelID - The channel, can be an ID or a Channel.
	 * @returns The messages fetched.
	 */
	public async fetchChannel(channelID: Snowflake | TextChannel): Promise<Collection<Snowflake, Message>> {
		const channel = channelID instanceof TextChannel ? channelID : await this.client.channels.fetch(channelID);
		let messages = new Collection<Snowflake, Message>();

		if (channel.isText()) {
			this.emit('fetchChannel', channel);
			this.fetching = true;
			let channelMessages = await channel.messages.fetch({
				limit: 100,
			});
			this.emit('fetch', channelMessages.size, channelMessages);

			while (channelMessages.size > 0) {
				messages = messages.concat(channelMessages);
				channelMessages = await channel.messages.fetch({
					limit: 100,
					before: channelMessages.last()!.id,
				});
				this.emit('fetch', channelMessages.size, channelMessages);
			}

			this.fetching = false;
		}
		return messages;
	}
	
	/**
	 * Fetch an array of Snowflakes or TextChannels or a collection of TextChannels.
	 * @param channels - The channels to fetch.
	 * @returns - The messages fetched.
	 */
	public async fetchChannels(channels: Array<Snowflake | TextChannel> | Collection<Snowflake, TextChannel>): Promise<Collection<Snowflake, Message>> {
		if (channels instanceof Collection) channels = channels.array();
		let messages = new Collection<Snowflake, Message>();
		
		this.fetching = true;
		for (const channel of channels) {
			const channelMessages = await this.fetchChannel(channel);
			messages = messages.concat(channelMessages);
		}
		this.fetching = false;
		
		return messages;
	}

	/**
	 * Fetch an entire guild, fetching every TextChannels one by one because there is no other way.
	 *
	 * @remarks
	 * Can be really long and you should prefer using events than waiting for it to finish.
	 *
	 * @param guildID - The guild to fetch, can be an ID or a Guild.
	 * @returns The messages fetched.
	 */
	public async fetchGuild(guildID: Snowflake | Guild): Promise<Collection<Snowflake, Message>> {
		const guild = guildID instanceof Guild ? guildID : await this.client.guilds.fetch(guildID);
		let messages = new Collection<Snowflake, Message>();
		if (guild) {
			const channels = guild.channels.cache.filter(c => c.isText()) as Collection<Snowflake, TextChannel>;
			this.emit('fetchGuild', guild);
			messages = await this.fetchChannels(channels);
		}

		return messages;
	}
}
