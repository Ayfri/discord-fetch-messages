import { Client, Message, Collection, Snowflake, TextChannel, Guild } from 'discord.js';
import { EventEmitter } from 'events';

export class Fetcher extends EventEmitter {
	public totalMessages: Collection<Snowflake, Message>;
	public fetching: boolean;

	public constructor(public readonly client: Client) {
		super();
		this.totalMessages = new Collection();
		this.fetching = false;
	}

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

	public async fetchGuild(guildID: Snowflake | Guild): Promise<Collection<Snowflake, Message>> {
		const guild = guildID instanceof Guild ? guildID : await this.client.guilds.fetch(guildID);
		let messages = new Collection<Snowflake, Message>();
		if (guild) {
			this.fetching = true;
			const channels = guild.channels.cache.filter(c => c.isText()) as Collection<Snowflake, TextChannel>;
			this.emit('fetchGuild', guild);

			for (const channel of channels.array()) {
				const channelMessages = await this.fetchChannel(channel);
				messages = messages.concat(channelMessages);
			}

			this.fetching = false;
		}

		return messages;
	}
}
