const { SlashCommandBuilder } = require('@discordjs/builders');
const { botTestingChannelId, suggestionsChannelId, newMoviesChannelId, newShowsChannelId, newEpisodesChannelId } = require('../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription(`Make a suggestion for a movie or show to be downloaded.`)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Your suggestion type.')
                .setRequired(true)
                .addChoices(
                    { name: 'Movie', value: 'movie' },
                    { name: 'TV Show', value: 'tvshow' }
                ))
        .addStringOption(option =>
            option.setName('source')
                .setDescription('Your suggestion source.')
                .setRequired(true)
                .addChoices(
                    { name: 'Title', value: 'title' },
                    { name: 'IMDB ID', value: 'imdb' }
                ))
        .addStringOption(option =>
            option.setName('suggestion')
                .setDescription('Enter the suggested movie or show title.')
                .setRequired(true)),
    async execute(interaction) {
        const type = interaction.options.getString('type')
        const source = interaction.options.getString('source')
        const suggestion = interaction.options.getString('suggestion')
        const userId = interaction.member.user.id
        switch (source){
            case 'title':
                interaction.client.channels.cache.get(botTestingChannelId.value).send(`User <@${userId}> suggested the following: **${suggestion}**`)
                interaction.client.channels.cache.get(suggestionsChannelId.value).send(`The following has been anonymously suggested for download:\n**${type}**\nTitle **${suggestion}**`)
                break
            case 'imdb':
                interaction.client.channels.cache.get(botTestingChannelId.value).send(`User <@${userId}> suggested the following: **https://www.imdb.com/title/${suggestion}/**`)
                interaction.client.channels.cache.get(suggestionsChannelId.value).send(`https://www.imdb.com/title/${suggestion}/`)
                break
        }

        switch (type){
            case 'movie':
                interaction.reply({ content: `Thanks for the suggestion! I'll see what I can do. Keep an eye on the <#${newMoviesChannelId.value}> channel for updates on when things arrive. Your suggestion has also been posted anonymously to the <#${suggestionsChannelId.value}> channel to allow for community discussion.`, ephemeral: true })
                break
            case 'tvshow':
                interaction.reply({ content: `Thanks for the suggestion! I'll see what I can do. Keep an eye on the <#${newShowsChannelId.value}>, and <#${newEpisodesChannelId.value}> channels for updates on when things arrive. Your suggestion has also been posted anonymously to the <#${suggestionsChannelId.value}> channel to allow for community discussion.`, ephemeral: true })
                break
        }
    }
}