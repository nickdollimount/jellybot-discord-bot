const { SlashCommandBuilder } = require('@discordjs/builders');
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
    jellyfinapi } = require('../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
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
                    await result.json().then((data) => {
                        let results = data.Items
                        if (results.length > 0){
                            let found = false
                            results.forEach((result) => {
                                result.ExternalUrls.forEach((url, index) => {
                                    if (isIMDB(url.Url)){
                                        found = true
                                        jellyfinServerId = results[index].ServerId
                                        jellyfinTitleId = results[index].Id
                                        return
                                    }
                                })
                            })
                            if (found === true){
                                alreadyOnServer = true
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
        }

        let source = 'title'
        if (undefined != isIMDB(suggestion)) {
            source = 'imdb'
            suggestion = isIMDB(suggestion)
        }

        let thread
        switch (source) {
            case 'title':
                // interaction.client.channels.cache.get(botTestingChannelId.value).send(`User <@${userId}> suggested the following: **${suggestion}**`)
                // thread = await interaction.client.channels.cache.get(suggestionsChannelId.value).threads.create({
                //     name: `${suggestion}`,
                //     autoArchiveDuration: 4320,
                //     reason: 'New user suggested title.'
                // })

                // thread.send(`The following title has been suggested:\n**${type}**\nTitle **${suggestion}**`)
                // thread.send(`This thread can be used for discussion about the suggested title.`)
                // // Add custom approve/disapprove emoji reactions to the suggested thread.
                // try {
                //     interaction.client.channels.cache.get(suggestionsChannelId.value).messages.fetch(thread.id)
                //         .then((message) => {
                //             const approveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customApproveEmojiName.value)
                //             message.react(approveEmoji)
                //             const disapproveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customDisapproveEmojiName.value)
                //             message.react(disapproveEmoji)
                //         })
                // } catch (error) { console.log(error) }
                break
            case 'imdb':
                let title
                let year
                await fetch(`http://www.omdbapi.com/?apikey=${omdbAPIKey.value}&i=${suggestion}`, {
                    method: "GET",
                }).then(async (result) => {
                    if (result.ok) {
                        await result.json().then(async (data) => {
                            title = data.Title
                            year = data.Year
                            await checkJellyfin(title)
                            console.log(alreadyOnServer)
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
                // thread = await interaction.client.channels.cache.get(suggestionsChannelId.value).threads.create({
                //     name: `${title} (${year})`,
                //     autoArchiveDuration: 4320,
                //     reason: 'New user suggested title.'
                // })

                // thread.send(`https://www.imdb.com/title/${suggestion}/`)
                // thread.send(`This thread can be used for discussion about the suggested title.`)

                // // Add custom approve/disapprove emoji reactions to the suggested thread.
                // try {
                //     interaction.client.channels.cache.get(suggestionsChannelId.value).messages.fetch(thread.id)
                //         .then((message) => {
                //             const approveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customApproveEmojiName.value)
                //             message.react(approveEmoji)
                //             const disapproveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customDisapproveEmojiName.value)
                //             message.react(disapproveEmoji)
                //         })
                // } catch (error) { console.log(error) }
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