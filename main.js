/**
 * Fetch all the messages from a Discord TextChannel
 * @param {module:"discord.js".Client} client
 * @param {module:"discord.js".TextChannel | module:"discord.js".NewsChannel} channel
 * @returns {Promise<module:"discord.js".Message[]>} - All the messages fetched.
 */
async function fetchChannelMessages(client, channel) {
	const total = [];
	let lastMessageID;
	let messages;

	if (!channel.isText()) return total;

	while (true) {
		if (lastMessageID) {
			messages = await channel.messages.fetch({
				limit: 100,
				before: lastMessageID,
			});
		} else {
			messages = await channel.messages.fetch({
				limit: 100,
			});
		}

		if (messages.size === 0) break;

		lastMessageID = messages.last().id;
		console.log(channel.name, total.length);
		total.push(...messages.array());
	}

	return total;
}

/**
 * Fetch all the messages from a Discord Guild.
 * @param {module:"discord.js".Client} client - The Discord Client.
 * @param {string} guildID - A guild ID.
 * @returns {Promise<module:"discord.js".Message[]>} - All the messages fetched.
 */
async function fetchGuildMessages(client, guildID) {
	const m = [];
	const channels = client.guilds.cache.get(guildID).channels.cache.filter(c => c.isText());
	console.log(channels);
	for (const channel of channels.array()) {
		const messages = await fetchChannelMessages(client, channel);

		if (!m.find(c => c.id === channel.id))
			m.push({
				id: channel.id,
				messages: [],
			});
		m.find(c => c.id === channel.id).messages.push(...messages.map(m => m.cleanContent));
	}

	return m;
}

module.exports = {
	fetchGuildMessages,
	fetchChannelMessages,
};
