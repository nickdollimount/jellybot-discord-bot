const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Replies with pong',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong'),
    async execute(interaction) {
        interaction.reply({ content: 'Pong', ephemeral: true })
    }
};