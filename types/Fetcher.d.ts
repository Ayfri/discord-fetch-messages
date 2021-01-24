/// <reference types="node" />
import { Client, Message, Collection, Snowflake, TextChannel, Guild } from 'discord.js';
import { EventEmitter } from 'events';
export declare class Fetcher extends EventEmitter {
    readonly client: Client;
    totalMessages: Collection<Snowflake, Message>;
    fetching: boolean;
    constructor(client: Client);
    fetchChannel(channelID: Snowflake | TextChannel): Promise<Collection<Snowflake, Message>>;
    fetchGuild(guildID: Snowflake | Guild): Promise<Collection<Snowflake, Message>>;
}
