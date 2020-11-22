![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Ayfri/discord-fetch-messages)
![npm](https://img.shields.io/npm/dt/discord-fetch-messages)
![npm](https://img.shields.io/npm/v/discord-fetch-messages?label=latest%20version)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Ayfri/discord-fetch-messages.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Ayfri/discord-fetch-messages/context:javascript)

# discord-fetch

A npm package to fetch all the messages from a guild or a channel.

## How to use it

<strong>⚠️ READ BEFORE USING ⚠️ <br>
These operations took a long time to process. Be patient and avoid doing this often because it's doing a lot of requests to Discord and you can be banned for sending too many requests to Discord. <br>
⚠️ READ BEFORE USING ⚠️
</strong>

```js
const fetchedGuildMessages = await require('discord-fetch-messages').fetchGuildMessages(client, id);

const fetchedChannelMessages = await require('discord-fetch-messages').fetchChannelMessages(client, id);
```

Note :

> Node.js > 14 is required.
