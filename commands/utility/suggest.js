const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const botTestingChannelId = process.env.botTestingChannelId,
    suggestionsChannelId = process.env.suggestionsChannelId,
    newMoviesChannelId = process.env.newMoviesChannelId,
    newShowsChannelId = process.env.newShowsChannelId,
    newEpisodesChannelId = process.env.newEpisodesChannelId,
    customApproveEmojiName = process.env.customApproveEmojiName,
    customDisapproveEmojiName = process.env.customDisapproveEmojiName,
    omdbAPIKey = process.env.omdbAPIKey,
    jellyfinUserId = process.env.jellyfinUserId,
    jellyfinServerURL = process.env.jellyfinServerURL,
    jellyfinapi = process.env.jellyfinapi

module.exports = {
    name: 'suggest',
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription(`Make a suggestion for a movie or show to be downloaded.`)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Your suggestion type.')
                .setRequired(true)
                .addChoices(
                    { name: 'Movie', value: 'movie' },
                    { name: 'Series', value: 'series' }
                ))
        .addStringOption(option =>
            option.setName('suggestion')
                .setDescription('Enter the suggested movie or show title. Also accepts IMDb ID or IMDb URL (preferred).')
                .setRequired(true)),
    async execute(interaction) {
        if (jellyfinUserId.length > 0){
            connectWithUser = `/Users/${jellyfinUserId}`
        }
        const getSearchURL = (searchCriteria) => {
            return `${jellyfinServerURL}${connectWithUser}/Items?searchTerm=${searchCriteria}&Recursive=true&IncludeMedia=true&IncludeItemTypes=Movie,Series&fields=externalurls&apikey=${jellyfinapi}`
        }

        let alreadyOnServer = false
        let jellyfinTitleId = ''
        let jellyfinServerId = ''
        let replied = false
        const type = interaction.options.getString('type')
        let suggestion = interaction.options.getString('suggestion')
        const userId = interaction.member.user.id

        const checkJellyfin = async (title) => {
            console.log(`Jellyfin Search: ${title}`)
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

        const getImdbDetails = async (imdbID) => {
            const searchURL = `http://www.omdbapi.com/?apikey=${omdbAPIKey}&i=${imdbID}`
            let tempImdbOjb
            await fetch(searchURL, {
                method: "GET",
            }).then(async (result) => {
                if (result.ok) {
                    await result.json().then(async (data) => {
                        if (data.Response == 'True'){
                            const imdbObj = {
                                imdbID: `${data.imdbID ?? 'n/a'}`,
                                title: `${data.Title ?? 'n/a'}`,
                                year: `${data.Year ?? 'n/a'}`,
                                genre: `${data.Genre ?? 'n/a'}`,
                                rated: `${data.Rated ?? 'n/a'}`,
                                posterURI: `${data.Poster ?? 'n/a'}`,
                                description: `${data.Plot ?? 'n/a'}`
                            }

                            tempImdbOjb = imdbObj
                        } else {
                            tempImdbOjb = flase
                        }
                    })
                } else {
                    tempImdbOjb = false
                }
            }).catch((error) => {
                console.log(error)
            })

            return tempImdbOjb
        }

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

        const addSuggestion = async (imdbObj) => {
            (imdbObj) ? await checkJellyfin(imdbObj.title) : await checkJellyfin(suggestion)

            if (!alreadyOnServer) {
                if (imdbObj) {
                    interaction.client.channels.cache.get(botTestingChannelId).send(`User <@${userId}> suggested the following: **https://www.imdb.com/title/${suggestion}/**`)
                } else {
                    interaction.client.channels.cache.get(botTestingChannelId).send(`User <@${userId}> suggested the following: **${suggestion}**`)
                }
                
                let thread = await interaction.client.channels.cache.get(suggestionsChannelId).threads.create({
                    name: (imdbObj) ? `${imdbObj.title} (${imdbObj.year})` : suggestion,
                    autoArchiveDuration: 10080,
                    reason: 'New user suggested title.'
                })
    
                if (imdbObj){
                    const newEmbed = new EmbedBuilder()
                    .setTitle(imdbObj.title)
                    .setDescription(imdbObj.description)
                    .addFields(
                        {name: 'Year', value: `${imdbObj.year ?? 'n/a'}`, inline: true},
                        {name: 'Genre', value: `${imdbObj.genre ?? 'n/a'}`, inline: true},
                        {name: 'Rated', value: `${imdbObj.rated ?? 'n/a'}`, inline: true},
                        {name: 'IMDb ID', value: `${imdbObj.imdbID ?? 'n/a'}`, inline: true}
                        )
                    .setURL(`https://www.imdb.com/title/${imdbObj.imdbID}/`)

                    if (imdbObj.posterURI != 'n/a' && imdbObj.posterURI != 'N/A'){
                        newEmbed.setThumbnail(`${imdbObj.posterURI}`)
                    }
                    
    
                    thread.send({embeds: [newEmbed]})
                } else {
                    thread.send(`Type **${type}**\nTitle **${suggestion}**`)
                }
                
                thread.send('This thread can be used for discussion about the suggested title.')
    
            // Add custom approve/disapprove emoji reactions to the suggested thread.
                try {
                    interaction.client.channels.cache.get(suggestionsChannelId).messages.fetch(thread.id)
                        .then((message) => {
                            const approveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customApproveEmojiName)
                            message.react(approveEmoji)
                            const disapproveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customDisapproveEmojiName)
                            message.react(disapproveEmoji)
                        })
                } catch (error) { console.log(error) }
    
                switch (type) {
                    case 'movie':
                        interaction.editReply({ content: `Thanks for the suggestion! I'll see what I can do. Keep an eye on the <#${newMoviesChannelId}> channel for updates on when things arrive. Your suggestion has also been posted anonymously to the <#${suggestionsChannelId}> channel to allow for community discussion.`, embeds: [], components: [], ephemeral: true })
                        break
                    case 'series':
                        interaction.editReply({ content: `Thanks for the suggestion! I'll see what I can do. Keep an eye on the <#${newShowsChannelId}>, and <#${newEpisodesChannelId}> channels for updates on when things arrive. Your suggestion has also been posted anonymously to the <#${suggestionsChannelId}> channel to allow for community discussion.`, embeds: [], components: [], ephemeral: true })
                        break
                }
            } else {
                await interaction.editReply({ content: `This title already exists on Jellyfin and can be found here: ${jellyfinServerURL}/web/index.html#!/details?id=${jellyfinTitleId}&serverId=${jellyfinServerId}`, embeds: [], components: [], ephemeral: true })
            }
        }

        let source = 'title'
        if (false != isIMDB(suggestion)) {
            source = 'imdb'
            suggestion = isIMDB(suggestion)
        }

        let omdbSearchURL

        switch (source) {
            case 'title':
                omdbSearchURL = `http://www.omdbapi.com/?apikey=${omdbAPIKey}&type=${type}&s=${suggestion}`
                break
            case 'imdb':
                omdbSearchURL = `http://www.omdbapi.com/?apikey=${omdbAPIKey}&i=${suggestion}`
                break
        }

        await fetch(omdbSearchURL, {
            method: "GET",
        }).then(async (result) => {
            if (result.ok) {
                await result.json().then(async (data) => {
                    if (data.Response == 'True'){
                        let foundResult
                        switch (source) {
                            case 'title':
                                foundResult = data.Search[0]
                                break
                            case 'imdb':
                                foundResult = data
                                break
                        }
                        

                        const newEmbed = new EmbedBuilder()
                            .setTitle(foundResult.Title)
                            .addFields(
                                {name: 'Year', value: `${foundResult.Year ?? 'n/a'}`, inline: true},
                                {name: 'IMDb ID', value: `${foundResult.imdbID ?? 'n/a'}`, inline: true}
                                )
                            .setURL(`https://www.imdb.com/title/${foundResult.imdbID}/`)

                        if (foundResult.Poster != 'N/A'){
                            newEmbed.setThumbnail(`${foundResult.Poster}`)
                        }

                        const button1 = new ButtonBuilder()
                        .setCustomId(`suggest_imdb`)
                        .setLabel("This is it!")
                        .setStyle(ButtonStyle.Primary);

                        const button2 = new ButtonBuilder()
                        .setCustomId(`suggest_title`)
                        .setLabel("Nah, use my suggestion")
                        .setStyle(ButtonStyle.Secondary);

                        const button3 = new ButtonBuilder()
                        .setCustomId(`suggest_cancel`)
                        .setLabel("Nevermind")
                        .setStyle(ButtonStyle.Danger);

                        const actionRow1 = new ActionRowBuilder()
                            .addComponents(button1)
                        
                        if (source == 'title') {
                            actionRow1.addComponents(button2)
                        }
                        
                        actionRow1.addComponents(button3)

                        await interaction.reply({
                            content: `Is this what you were looking for?`,
                            embeds: [newEmbed],
                            components: [actionRow1],
                            ephemeral: true
                        })

                        replied = true

                        const collector = interaction.channel.createMessageComponentCollector({
                            time: 60000, // Time limit for interaction (ms)
                            filter: (i) => i.isButton() && i.user.id === interaction.user.id, // Only allow own interaction
                          });
                          
                          collector.on('collect', async (i) => {
                            switch (i.customId){
                                case 'suggest_imdb':
                                    // Accept the suggested title.
                                    suggestion = foundResult.imdbID
                                    const newImdbObj = await getImdbDetails(foundResult.imdbID)
                                    await interaction.editReply({components: []})
                                    await addSuggestion(newImdbObj)
                                    collector.stop()
                                    break
                                case 'suggest_title':
                                    await interaction.editReply({components: []})
                                    await addSuggestion()
                                    collector.stop()
                                    break
                                default:
                                    await interaction.editReply({ content: `You've cancelled your suggestion. Please try again when you're ready. ✌️`, embeds: [], components: [] })
                                    collector.stop()
                            }
                          });
                          
                          collector.on('end', (collected) => {
                            // Remove buttons after interaction is done
                            interaction.editReply({ components: [] })
                          });
                    } else {
                        interaction.reply({content: `Unfortunately your suggestion of '${suggestion}' wasn't found in the OMDB database. Please check the spelling and try again or search IMDB to make sure your suggestion is available on there and try again. https://imdb.com`, ephemeral: true})        
                    }
                })
            } else {
                interaction.reply({content: `Unfortunately your suggestion of '${suggestion}' wasn't found in the OMDB database. Please check the spelling and try again or search IMDB to make sure your suggestion is available on there and try again. https://imdb.com`, ephemeral: true})
            }
        }).catch((error) => {
            console.log(error)
        })
    },
    description: `Make a suggestion for a movie or show to be downloaded.`
}