/// <reference types="node" />
import { Client, Message, Collection, Snowflake, TextChannel, Guild } from 'discord.js';
import { EventEmitter } from 'events';
/**
 * The main class used to fetch things.
 */
export declare class Fetcher extends EventEmitter {
    readonly client: Client;
    /**
     * A simple property set to `true` when the Fetcher is fetching a bulk of messages, then set to false.
     */
    fetching: boolean;
    constructor(client: Client);
    fetchChannel(channelID: Snowflake | TextChannel): Promise<Collection<Snowflake, Message>>;
    fetchGuild(guildID: Snowflake | Guild): Promise<Collection<Snowflake, Message>>;
}
