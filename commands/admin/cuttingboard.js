const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cuttingboard')
        .setDescription(`Add show to the cutting board.`)
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Jellyfin Share URL.')
                .setRequired(true))
    ,
    async execute(interaction) {
        const roundNum = (userNum) => { // Used to output rounded up number to single decimal point for ratings.
            if (userNum == undefined) { return null }
            roundedNumber = Math.round(Number(userNum) * 10) / 10
            roundedNumber = roundedNumber + ""
            if (roundedNumber.indexOf('.') == -1) {
                roundedNumber = roundedNumber + '.0'
            }
            return roundedNumber
        }

        const { cuttingBoardChannelId, jellyfinUserId, jellyfinServerURL, jellyfinapi, customApproveEmojiName, customDisapproveEmojiName } = require('../../config/config.json')

        let connectWithUser = ''

        if (jellyfinUserId.value.length > 0) {
            connectWithUser = `/Users/${jellyfinUserId.value}`
        }

        const getItemID = (url) => {
            const regex = /^(?:http:\/\/|https:\/\/)?(?:[a-z0-9.]*)?(?:\/web\/index.html#!\/details\?id=)?([a-z0-9]*)/gmi

            let m
            while ((m = regex.exec(url)) !== null) {
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++
                }
                return m[1]
            }
        }

        const getSearchURL = () => {
            return `${jellyfinServerURL.value}${connectWithUser}/Items?ids=${itemId}&fields=overview,externalurls,genres&apikey=${jellyfinapi.value}`
        }

        const itemURL = interaction.options.getString('url')
        const itemId = getItemID(itemURL)

        let showName
        let shows = []

        // End variables declarations

        await fetch(getSearchURL(), {
            method: "GET",
        }).then(async (result) => {
            if (result.ok) {
                await result.json().then((data) => {
                    let results = data.Items
                    if (results.length > 0) {
                        results.forEach((show) => {
                            shows.push(show)
                        })
                    }
                })
            }
        }).catch((error) => {
            console.log(error)
        })

        if (shows.length === 1) {
            let resultEmbeds = []

            // Process results for result cards
            let processResults = async (results) => {
                results.forEach((result) => {
                    const newEmbed = new EmbedBuilder()
                        .setTitle(result.Name)
                        .setDescription(result.Type)
                        .addFields(
                            { name: 'Year', value: `${result.ProductionYear ?? 'n/a'}`, inline: true },
                            { name: 'Score', value: `⭐ ${roundNum(result.CommunityRating) ?? 'n/a'} 🍅 ${result.CriticRating ?? 'n/a'}`, inline: true },
                            { name: 'Rated', value: `${result.OfficialRating ?? 'n/a'}`, inline: true }
                        )
                        .setURL(`${jellyfinServerURL.value}/web/index.html#!/details?id=${result.Id}&serverId=${result.ServerId}`)
                        .setThumbnail(`${jellyfinServerURL.value}/Items/${result.Id}/Images/Primary`)
                    
                    showName = `${result.Name} (${result.ProductionYear})`

                    if (result.Genres.length > 0) {
                        let genres = ''
                        result.Genres.forEach((genre, index) => {
                            genres += `${genre}`
                            if (index < (result.Genres.length - 1)) {
                                genres += ', '
                            }
                        })
                        newEmbed.addFields(
                            { name: 'Genres', value: genres }
                        )
                    }

                    newEmbed.addFields(
                        { name: 'Overview', value: (result.Overview.substring(0, 1023) ?? 'n/a') }
                    )

                    if (result.ExternalUrls.length > 0) {
                        let extUrls = ''
                        result.ExternalUrls.forEach((urlItem) => {
                            extUrls += hyperlink(`${urlItem.Name} `, `<${urlItem.Url}>`)
                        })
                        newEmbed.addFields(
                            { name: 'External Links', value: extUrls }
                        )
                    }

                    if (resultEmbeds.length < 10) {
                        resultEmbeds.push(newEmbed)
                    }
                })
            }
            // End processing results

            if (shows.length > 0) {
                await processResults(shows)
            }

            thread = await interaction.client.channels.cache.get(cuttingBoardChannelId.value).threads.create({
                name: `${showName}`,
                autoArchiveDuration: 4320,
                reason: 'Item added to the cutting board.'
            })

            thread.send({ embeds: resultEmbeds, content: `The following item has been added to the cutting board.`, ephemeral: true })
            try {
                interaction.client.channels.cache.get(cuttingBoardChannelId.value).messages.fetch(thread.id)
                    .then((message) => {
                        const approveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customApproveEmojiName.value)
                        message.react(approveEmoji)
                        const disapproveEmoji = message.guild.emojis.cache.find(emoji => emoji.name === customDisapproveEmojiName.value)
                        message.react(disapproveEmoji)
                    })
            } catch (error) { console.log(error) }

            thread.send(`If there are no objections, this will be removed from the Jellyfin server in a few days from now.`)

            await interaction.reply({ embeds: resultEmbeds, content: `The following show has been added to the cutting board.`, ephemeral: true })
        } else {
            await interaction.reply({ content: `Sorry, no results found on the Jellyfin server`, ephemeral: true });
        }
    }
};