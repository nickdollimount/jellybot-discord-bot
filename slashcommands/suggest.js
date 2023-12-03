const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require('discord.js');
const { botTestingChannelId,
    suggestionsChannelId,
    newMoviesChannelId,
    newShowsChannelId,
    newEpisodesChannelId,
    customApproveEmojiName,
    customDisapproveEmojiName,
    omdbAPIKey,
    jellyfinUserId,
    jellyfinServerURL,
    jellyfinapi } = require('../config/config.json')

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
                .setDescription('Enter the suggested movie or show title. Also accepts IMDb ID or IMDb URL.')
                .setRequired(true)),
    async execute(interaction) {
        if (jellyfinUserId.value.length > 0){
            connectWithUser = `/Users/${jellyfinUserId.value}`
        }
        const getSearchURL = (searchCriteria) => {
            return `${jellyfinServerURL.value}${connectWithUser}/Items?searchTerm=${searchCriteria}&Recursive=true&IncludeMedia=true&IncludeItemTypes=Movie,Series&fields=externalurls&apikey=${jellyfinapi.value}`
        }

        let alreadyOnServer = false
        let jellyfinTitleId = ''
        let jellyfinServerId = ''
        let replied = false

        const checkJellyfin = async (title) => {
            await fetch(getSearchURL(title), {
                method: "GET",
            }).then(async (result) => {
                if (result.ok) {
                    console.log('Jellyfin Search Result: OK')
                    await result.json().then((data) => {
                        let results = data.Items
                        
                        if (results.length > 0){
                            let found = false
                            results.forEach((result) => {
                                result.ExternalUrls.forEach((url, index) => {
                                    if (isIMDB(url.Url) === suggestion){
                                        found = true
                                        jellyfinServerId = result.ServerId
                                        jellyfinTitleId = result.Id
                                        return
                                    }
                                })
                            })
                            if (found === true){
                                alreadyOnServer = true
                                console.log('AlreadyOnServer = TRUE')
                            }
                        }
                    })
                }
            }).catch((error) => {
                console.log(error)
            })
        }
        const type = interaction.options.getString('type')
        // const source = interaction.options.getString('source')

        let suggestion = interaction.options.getString('suggestion')
        const userId = interaction.member.user.id

        const isIMDB = (str) => {
            const regex = /^(?:http:\/\/|https:\/\/)?(?:www\.|m\.)?(?:imdb.com\/title\/)?(tt[0-9]*)/gmi
            let m
            while ((m = regex.exec(str)) !== null) {
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++
                }
                return m[1]
            }

            return false
        }

        let source = 'title'
        if (false != isIMDB(suggestion)) {
            source = 'imdb'
            suggestion = isIMDB(suggestion)
        }

        let thread
        switch (source) {
            case 'title':
                console.log('Source: TITLE')
                interaction.client.channels.cache.get(botTestingChannelId.value).send(`User <@${userId}> suggested the following: **${suggestion}**`)
                thread = await interaction.client.channels.cache.get(suggestionsChannelId.value).threads.create({
                    name: `${suggestion}`,
                    autoArchiveDuration: 10080,
                    reason: 'New user suggested title.'
                })

                thread.send(`Type **${type}**\nTitle **${suggestion}**`)
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
                console.log('Source: IMDB')
                let title
                let year
                let description
                let rated
                let imdbRating
                let imdbID
                let genre
                let posterURI

                await fetch(`http://www.omdbapi.com/?apikey=${omdbAPIKey.value}&i=${suggestion}`, {
                    method: "GET",
                }).then(async (result) => {
                    if (result.ok) {
                        await result.json().then(async (data) => {
                            title = data.Title
                            year = data.Year
                            description = data.Plot
                            rated = data.Rated
                            imdbRating = data.imdbRating
                            imdbID = data.imdbID
                            genre = data.Genre
                            posterURI = data.Poster

                            await checkJellyfin(title)

                            if (alreadyOnServer === true) {
                                interaction.reply({ content: `This title already exists on Jellyfin and can be found here: ${jellyfinServerURL.value}/web/index.html#!/details?id=${jellyfinTitleId}&serverId=${jellyfinServerId}`, ephemeral: true })
                                replied = true
                                return
                            }

                        })
                    } else {
                        title = suggestion
                        year = 'n/a'
                    }
                }).catch((error) => {
                    console.log(error)
                })

                if (alreadyOnServer === false) {
                    interaction.client.channels.cache.get(botTestingChannelId.value).send(`User <@${userId}> suggested the following: **https://www.imdb.com/title/${suggestion}/**`)
                    thread = await interaction.client.channels.cache.get(suggestionsChannelId.value).threads.create({
                        name: `${title} (${year})`,
                        autoArchiveDuration: 10080,
                        reason: 'New user suggested title.'
                    })

                    const newEmbed = new EmbedBuilder()
                        .setTitle(title)
                        .setDescription(description)
                        .addFields(
                            {name: 'Year', value: `${year ?? 'n/a'}`, inline: true},
                            {name: 'Genre', value: `${genre ?? 'n/a'}`, inline: true},
                            {name: 'Rated', value: `${rated ?? 'n/a'}`, inline: true},
                            {name: 'IMDb ID', value: `${imdbID ?? 'n/a'}`, inline: true}
                            )
                        .setURL(`https://www.imdb.com/title/${imdbID}/`)
                        .setThumbnail(`${posterURI}`)

                    thread.send({embeds: [newEmbed]})
                    thread.send('This thread can be used for discussion about the suggested title.')

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
                }
                
                break
        }

        if (replied === false) {
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
}