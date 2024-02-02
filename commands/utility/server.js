const { SlashCommandBuilder } = require('discord.js');
const accountRequestsUserId = process.env.accountRequestsUserId,
jellyfinServerURL = process.env.jellyfinServerURL

module.exports = {
    name: 'server',
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription(`Information about the Jellyfin server.`),
    async execute(interaction) {
        interaction.reply({ content: `The Jellyfin server can be reached ${jellyfinServerURL} 🌐. If you want to request a login for it, please send a DM to <@${accountRequestsUserId}>.`, ephemeral: true })
    },
    description: `Information about the Jellyfin server.`
};