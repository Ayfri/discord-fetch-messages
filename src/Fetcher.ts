import {Channel, Client, Collection, Guild, Message, NewsChannel, Permissions, Snowflake, TextChannel, ThreadChannel} from 'discord.js';

import {EventEmitter} from 'events';

export interface Events {
	fetch: [size: number, messages: Collection<Snowflake, Message>];
	fetchChannel: [channel: FetchChannel];
	fetchGuild: [guild: Guild];
	fetchThread: [thread: ThreadChannel, parentChannel: FetchChannel | null];
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

	private isFetchChannel(channel: any): channel is TextChannel | NewsChannel {
		return channel instanceof TextChannel || channel instanceof NewsChannel;
	}

	/**
	 * Fetch the entire list of messages from a channel, can be long and makes you have rateLimits.
	 *
	 * @param channelID - The channel, can be an ID or a Channel.
	 * @param threads - If set to `true` it will fetch its threads.
	 * @returns The messages fetched.
	 */
	public async fetchChannel(channelID: Snowflake | FetchChannel, threads: boolean = false) {
		const channel = typeof channelID === 'string' ? await this.client.channels.fetch(channelID) : channelID;
		let messages = new Collection<Snowflake, Message>();

		if (this.isFetchChannel(channel)) {
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

			if (threads) {
				const threadsMessages = await this.fetchThreads(channel);
				messages = messages.concat(threadsMessages);
			}

			this.fetching = false;
		}

		return messages;
	}

	/**
	 * Fetch an array of Snowflakes or TextChannels or a collection of TextChannels.
	 *
	 * @param channels - The channels to fetch.
	 * @param threads - If set to `true` it will fetch all the threads of all the channels.
	 * @returns - The messages fetched.
	 */
	public async fetchChannels(channels: Array<Snowflake | FetchChannel> | Collection<Snowflake, FetchChannel>, threads: boolean = false) {
		if (channels instanceof Collection) channels = [...channels.values()];
		let messages = new Collection<Snowflake, Message>();

		this.fetching = true;
		for (const channel of channels) {
			const channelMessages = await this.fetchChannel(channel, threads);
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
	 * @param threads - If set to `true` it will fetch all the threads of the guild.
	 * @returns The messages fetched.
	 */
	public async fetchGuild(guildID: Snowflake | Guild, threads: boolean = false) {
		const guild = guildID instanceof Guild ? guildID : await this.client.guilds.fetch(guildID);
		let messages = new Collection<Snowflake, Message>();
		if (guild) {
			const channels = guild.channels.cache.filter(c => c.isText() && !c.isThread()) as Collection<Snowflake, FetchChannel>;
			this.emit('fetchGuild', guild);
			messages = await this.fetchChannels(channels, threads);
		}

		return messages;
	}

	public async fetchThread(thread: ThreadChannel): Promise<Collection<Snowflake, Message>>;
	public async fetchThread(threadID: Snowflake, channelID: Snowflake | FetchChannel): Promise<Collection<Snowflake, Message>>;
	/**
	 * Fetch the entire list of messages from a Thread.
	 *
	 * @remarks
	 * If the thread is private, the client need the `MANAGE_THREADS` permissions.
	 *
	 * @param threadID - The thread ID or Thread itself, if an ID is provided you have to set the second paramter.
	 * @param channelID - The channel ID or Channel itself of the Thread, only necessary if you provide a Thread ID, else it is not used.
	 * @returns The messages fetched.
	 */
	public async fetchThread(threadID: Snowflake | ThreadChannel, channelID?: Snowflake | FetchChannel) {
		let messages = new Collection<Snowflake, Message>();

		if (typeof threadID === 'string' && !channelID) throw Error('channelID is required when using ThreadID.');
		let thread: ThreadChannel | null = null;
		if (threadID instanceof ThreadChannel) thread = threadID;
		else if (channelID) {
			const channel = typeof channelID === 'string' ? await this.client.channels.fetch(channelID) : channelID;
			if (this.isFetchChannel(channel)) thread = await channel.threads.fetch(threadID);
			else return messages;
		}

		if (thread) {
			if (thread.type === 'GUILD_PRIVATE_THREAD' && !thread.permissionsFor(this.client.user!)?.has(Permissions.FLAGS.MANAGE_THREADS, false)) {
				return messages;
			}

			this.fetching = true;
			this.emit('fetchThread', thread, thread.parent);
			let threadMessages = await thread.messages.fetch({
				limit: 100,
			});
			this.emit('fetch', threadMessages.size, threadMessages);

			while (threadMessages.size > 0) {
				messages = messages.concat(threadMessages);
				threadMessages = await thread.messages.fetch({
					limit: 100,
					before: threadMessages.last()!.id,
				});
				this.emit('fetch', threadMessages.size, threadMessages);
			}

			this.fetching = false;
		}

		return messages;
	}

	public async fetchThreads(channel: Guild): Promise<Collection<Snowflake, Message>>;
	public async fetchThreads(channel: FetchChannel): Promise<Collection<Snowflake, Message>>;
	public async fetchThreads(threadsIDs: Array<ThreadChannel> | Collection<Snowflake, ThreadChannel>): Promise<Collection<Snowflake, Message>>;
	public async fetchThreads(threadsIDs: Array<Snowflake> | Collection<Snowflake, Snowflake>, channelID: Snowflake | FetchChannel): Promise<Collection<Snowflake, Message>>;
	/**
	 * Fetch the entire list of messages from multiple threads or all the threads of a channel or all threads of a guild.
	 *
	 * @remarks
	 * If one of the thread is private, it will need the `MANAGE_THREADS` permission to be able to fetch its messages.
	 *
	 * @params threadsIDs - A list or a collection of threads or snowflakes to fetch messages from, if snowflakes are provided, you will need the second argument, or a channel where it will fetch all its channels, or a guild where it will fetch all its threads from all its channels.
	 * @param channelID - The channel ID or the Channel itself parant to all the threads passed as snowflakes, it will fetch the threads from this channel.
	 * @returns - All the messages fetched.
	 */
	public async fetchThreads(threadsIDs: Array<Snowflake | ThreadChannel> | Collection<Snowflake, Snowflake | ThreadChannel> | FetchChannel | Guild, channelID?: Snowflake | FetchChannel) {
		let messages = new Collection<Snowflake, Message>();
		let threads: Array<ThreadChannel> = [];
		let channel: FetchChannel | null = null;
		if (channelID) {
			const c = typeof channelID === 'string' ? await this.client.channels.fetch(channelID) : channelID;
			if (this.isFetchChannel(c)) channel = c;
		}

		async function resolveThread(thread: Snowflake | ThreadChannel) {
			if (thread instanceof ThreadChannel) {
				threads.push(thread);
			} else {
				if (channel) {
					const t = await channel.threads.fetch(thread);
					if (t) threads.push(t);
				}
			}
		}
		if (threadsIDs instanceof Guild) threads = (await Promise.all((await threadsIDs.channels.fetch()).filter(this.isFetchChannel).map(async c => [...(await c.threads.fetch()).threads.values()]))).flat();
		else if (this.isFetchChannel(threadsIDs)) threads = [...(await threadsIDs.threads.fetch()).threads.values()];
		else if (threadsIDs instanceof Collection) [...threadsIDs.values()].forEach(resolveThread);
		else threadsIDs.forEach(resolveThread);

		threads.forEach(async thread => {
			const threadMessages = await this.fetchThread(thread);
			messages = messages.concat(threadMessages);
		});

		return messages;
	}
}
