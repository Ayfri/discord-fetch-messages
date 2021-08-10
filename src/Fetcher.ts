import {Client, Collection, Guild, Message, NewsChannel, Snowflake, TextChannel} from 'discord.js';

import {EventEmitter} from 'events';

export interface Events {
	fetch: [size: number, messages: Collection<Snowflake, Message>];
	fetchChannel: [channel: TextChannel];
	fetchGuild: [guild: Guild];
}

type FetchChannel = NewsChannel | TextChannel;

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

	public on<K extends keyof Events>(event: K, listener: (args: Events[K]) => void) {
		return super.on(event, listener);
	}

	public once<K extends keyof Events>(event: K, listener: (args: Events[K]) => void) {
		return super.on(event, listener);
	}

	public emit<K extends keyof Events>(event: K, ...args: Events[K]) {
		return super.emit(event, args);
	}

	public eventNames() {
		return super.eventNames() as Array<keyof Events>;
	}

	public off<K extends keyof Events>(event: K, listener: (args: Events[K]) => void) {
		return super.off(event, listener);
	}

	/**
	 * Fetch the entire list of messages from a channel, can be long and makes you have rateLimits.
	 *
	 * @param channelID - The channel, can be an ID or a Channel.
	 * @returns The messages fetched.
	 */
	public async fetchChannel(channelID: Snowflake | FetchChannel) {
		const channel = typeof channelID === 'string' ? await this.client.channels.fetch(channelID) : channelID;
		let messages = new Collection<Snowflake, Message>();

		if (channel instanceof TextChannel) {
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
	public async fetchChannels(channels: Array<Snowflake | FetchChannel> | Collection<Snowflake, FetchChannel>) {
		if (channels instanceof Collection) channels = [...channels.values()];
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
	public async fetchGuild(guildID: Snowflake | Guild) {
		const guild = guildID instanceof Guild ? guildID : await this.client.guilds.fetch(guildID);
		let messages = new Collection<Snowflake, Message>();
		if (guild) {
			const channels = guild.channels.cache.filter(c => c.isText() && !c.isThread()) as Collection<Snowflake, FetchChannel>;
			this.emit('fetchGuild', guild);
			messages = await this.fetchChannels(channels);
		}

		return messages;
	}
}
