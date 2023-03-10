const { SlashCommandBuilder } = require('@discordjs/builders');
const { accountRequestsUserId, jellyfinServerURL } = require('../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription(`Information about the Jellyfin server.`),
    async execute(interaction) {
        interaction.reply({ content: `The Jellyfin server can be reached ${jellyfinServerURL.value} 🌐. If you want to request a login for it, please send a DM to <@${accountRequestsUserId.value}>.`, ephemeral: true })
    }
};