const { SlashCommandBuilder } = require('@discordjs/builders');
const { botTestingChannelId, suggestionsChannelId, newMoviesChannelId, newShowsChannelId, newEpisodesChannelId, customApproveEmojiName, customDisapproveEmojiName, omdbAPIKey } = require('../config.json')

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
            option.setName('suggestion')
                .setDescription('Enter the suggested movie or show title.')
                .setRequired(true)),
    async execute(interaction) {
        const type = interaction.options.getString('type')
        // const source = interaction.options.getString('source')

        let suggestion = interaction.options.getString('suggestion')
        const userId = interaction.member.user.id

        const isIMDB = (str) => {
            const regex = /^(?:http:\/\/|https:\/\/)?(?:www\.)?(?:imdb.com\/title\/)?(tt[0-9]*)/gmi
        
            let m
            while ((m = regex.exec(str)) !== null) {
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++
                }
                return m[1]
            }
        }

        let source = 'title'
        if (undefined != isIMDB(suggestion)) {
            source = 'imdb'
            suggestion = isIMDB(suggestion)
        }

        let thread
        switch (source) {
            case 'title':
                interaction.client.channels.cache.get(botTestingChannelId.value).send(`User <@${userId}> suggested the following: **${suggestion}**`)
                thread = await interaction.client.channels.cache.get(suggestionsChannelId.value).threads.create({
                    name: `${suggestion}`,
                    autoArchiveDuration: 4320,
                    reason: 'New user suggested title.'
                })

                thread.send(`The following title has been suggested:\n**${type}**\nTitle **${suggestion}**`)
                thread.send(`This thread can be used for discussion about the suggested title.`)
                // Add custom approve/disapprove emoji reactions to the suggested thread.
                try {
                    interaction.client.channels.cache.get(suggestionsChannelId.value).messages.fetch(thread.id)
                        .then((message) => {
                            const approveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customApproveEmojiName.value)
                            message.react(approveEmoji)
                            const disapproveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customDisapproveEmojiName.value)
                            message.react(disapproveEmoji)
                        })
                } catch (error) { console.log(error) }
                break
            case 'imdb':
                let title
                let year
                await fetch(`http://www.omdbapi.com/?apikey=${omdbAPIKey.value}&i=${suggestion}`, {
                    method: "GET",
                }).then(async (result) => {
                    if (result.ok) {
                        await result.json().then((data) => {
                            title = data.Title
                            year = data.Year
                        })
                    } else {
                        title = suggestion
                        year = 'n/a'
                    }
                }).catch((error) => {
                    console.log(error)
                })

                interaction.client.channels.cache.get(botTestingChannelId.value).send(`User <@${userId}> suggested the following: **https://www.imdb.com/title/${suggestion}/**`)
                thread = await interaction.client.channels.cache.get(suggestionsChannelId.value).threads.create({
                    name: `${title} (${year})`,
                    autoArchiveDuration: 4320,
                    reason: 'New user suggested title.'
                })

                thread.send(`https://www.imdb.com/title/${suggestion}/`)
                thread.send(`This thread can be used for discussion about the suggested title.`)

                // Add custom approve/disapprove emoji reactions to the suggested thread.
                try {
                    interaction.client.channels.cache.get(suggestionsChannelId.value).messages.fetch(thread.id)
                        .then((message) => {
                            const approveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customApproveEmojiName.value)
                            message.react(approveEmoji)
                            const disapproveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customDisapproveEmojiName.value)
                            message.react(disapproveEmoji)
                        })
                } catch (error) { console.log(error) }
                break
        }

        switch (type) {
            case 'movie':
                interaction.reply({ content: `Thanks for the suggestion! I'll see what I can do. Keep an eye on the <#${newMoviesChannelId.value}> channel for updates on when things arrive. Your suggestion has also been posted anonymously to the <#${suggestionsChannelId.value}> channel to allow for community discussion.`, ephemeral: true })
                break
            case 'tvshow':
                interaction.reply({ content: `Thanks for the suggestion! I'll see what I can do. Keep an eye on the <#${newShowsChannelId.value}>, and <#${newEpisodesChannelId.value}> channels for updates on when things arrive. Your suggestion has also been posted anonymously to the <#${suggestionsChannelId.value}> channel to allow for community discussion.`, ephemeral: true })
                break
        }
    }
}