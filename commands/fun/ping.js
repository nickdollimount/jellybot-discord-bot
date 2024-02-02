const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong'),
    async execute(interaction) {
        interaction.reply({ content: 'Pong', ephemeral: true })
    },
    description: 'Replies with pong'
};