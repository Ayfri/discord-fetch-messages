![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Ayfri/discord-fetch-messages)
![npm](https://img.shields.io/npm/dt/discord-fetch-messages)
![npm](https://img.shields.io/npm/v/discord-fetch-messages?label=latest%20version)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Ayfri/discord-fetch-messages.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Ayfri/discord-fetch-messages/context:javascript)

# discord-fetch

A npm package to fetch all the messages from a guild, a channel or a thread.

## How to use it

<strong>⚠️ READ BEFORE USING ⚠️ <br>
These operations took a long time to process. Be patient and avoid doing this often because it's doing a lot of requests to Discord and you can be banned for sending too many requests to Discord. <br>
⚠️ READ BEFORE USING ⚠️
</strong>

```js
const fetcher = new Fetcher(client);

fetcher.on('fetchChannel', async channel => {
	await message.channel.send(`Fetching <#${channel.id}>.`);
});

const guildMessages = await fetcher.fetchGuild(guildID);
const channelMessages = await fetcher.fetchChannel(channel);
const threadMessages = await fetcher.fetchThread(thread);

const channelsMessages = await fetcher.fetchChannels(guild.channels.filter(channel => channel.isText() && channel.name.startsWith('g')));
const guildMessagesAndThreads = await fetcher.fetchGuild(guildID, true);

const threadsMessages = await fetcher.fetchThreads(threadsIDs, parentChannelOfThreads);
```

## Event list :

| Event Name     | Description                                                              | Arguments                                                                                        |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `fetchChannel` | Emitter when fetching a Channel.                                         | `channel`: The channel fetched.                                                                  |
| `fetchGuild`   | Emitted when fetching a Guild.                                           | `guild`: The guild fetched.                                                                      |
| `fetch`        | Emitted after fetched a bulk a of messages, can fetch 0 to 100 messages. | `length`: The number of messages fetched.<br/>`messages`: The messages fetched, as a Collection. |
| `fetchThread` | Emitted when fetching a Thread.                                           | `thread`: The thread
fetched.<br/>`channel`: The parent channel of the Thread. |
You can also use a `fetching` boolean property that is set to true when fetching a bulk of message, then to false.

> Note :
>
> Node.js > 16 is required.
