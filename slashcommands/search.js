const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription(`Search Jellyfin. Max 10 detailed results.`)
        .addStringOption(option =>
            option.setName('criteria')
                .setDescription('Search criteria')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Media type')
                .setRequired(false)
                .addChoices(
                    { name: 'Movie', value: 'movie' },
                    { name: 'Series', value: 'series' }
                ))
        .addBooleanOption(option =>
            option.setName('full')
            .setDescription('Set to True for full search results in a stripped down list format')
            )
    ,
    async execute(interaction) {
        const roundNum = (userNum) => { // Used to output rounded up number to single decimal point for ratings.
            if (userNum == undefined) { return null }
            roundedNumber = Math.round(Number(userNum) * 10) / 10
            roundedNumber = roundedNumber + ""
            if(roundedNumber.indexOf('.') == -1){
                roundedNumber = roundedNumber + '.0'
            }
            return roundedNumber
        }

        const { suggestionsChannelId, jellyfinUserId, jellyfinServerURL, jellyfinapi } = require('../config/config.json')

        let connectWithUser = ''

        if (jellyfinUserId.value.length > 0){
            connectWithUser = `/Users/${jellyfinUserId.value}`
        }

        const getSearchURL = (type) => {
            return `${jellyfinServerURL.value}${connectWithUser}/Items?searchTerm=${searchCriteria}&Recursive=true&IncludeMedia=true&IncludeItemTypes=${type}&fields=overview,externalurls,genres&apikey=${jellyfinapi.value}`
        }

        let type = interaction.options.getString('type')
        if (null == type){
            type = 'all'
        }

        let fullResults = interaction.options.getBoolean('full')
        if (null == fullResults){
            fullResults = false
        }

        const searchCriteria = interaction.options.getString('criteria')

        let totalResults = 0
        let movies = []
        let shows = []

        // End variables declarations

        if (type === 'movie' || type === 'all'){
            await fetch(getSearchURL('Movie'), {
                method: "GET",
            }).then(async (result) => {
                if (result.ok) {
                    await result.json().then((data) => {
                        let results = data.Items
                        if (results.length > 0){
                            results.forEach((movie) => {
                                if (fullResults){
                                    movies.push(movie)
                                } else {
                                    if (totalResults < 11){
                                        movies.push(movie)
                                    }
                                }                                
                                totalResults += 1
                            })
                        }
                    })
                }
            }).catch((error) => {
                console.log(error)
            })
        }
        
        if (type === 'series' || type === 'all'){
            await fetch(getSearchURL('Series'), {
                method: "GET",
            }).then(async (result) => {
                if (result.ok) {
                    await result.json().then((data) => {
                        let results = data.Items
                        if (results.length > 0){
                            results.forEach((show) => {
                                if (fullResults){
                                    shows.push(show)
                                } else {
                                    if (totalResults < 11){
                                        shows.push(show)
                                    }
                                }                                 
                                totalResults += 1
                            })
                        }
                    })
                }
            }).catch((error) => {
                console.log(error)
            })
        }

        if (movies.length > 0 || shows.length > 0){
            if (fullResults){
                let moviesReply = ''
                let showsReply = ''
                let moviesReplyCutoff = false
                let showsReplyCutoff = false
                
                if (movies.length > 0){
                    moviesReply += `\n**Movies**\n`
                    movies.forEach((movie) => {
                        if (moviesReply.length + movie.Name.length <= 1998){
                            moviesReply += `${movie.Name}\n`
                        } else {
                            moviesReplyCutoff = true
                        }
                    })
                }


                if (shows.length > 0){
                    showsReply += `\n**Series**\n`
                    shows.forEach((show) => {
                        if (showsReply.length + show.Name.length <= 1998){
                            showsReply += `${show.Name}\n`
                        } else {
                            showsReplyCutoff = true
                        }
                    })
                }

                await interaction.reply({ content: `The following have been found on the Jellyfin server when searching for: **${searchCriteria}**\n`, ephemeral: true })
                if (movies.length > 0 && (type === 'movie' || type === 'all')){
                    await interaction.followUp({ content: `${moviesReply.substring(0,1999)}`, ephemeral: true })
                    if (moviesReplyCutoff){
                        await interaction.followUp({ content: `The resulting list of movies exceeded the maximum 2000 character limit. If you haven't found what you're looking for above, please narrow your search and try again.`, ephemeral: true })
                    }
                }

                if (shows.length > 0 && (type === 'series' || type === 'all')){
                    await interaction.followUp({ content: `${showsReply.substring(0,1999)}`, ephemeral: true })
                    if (showsReplyCutoff){
                        await interaction.followUp({ content: `The resulting list of TV shows exceeded the maximum 2000 character limit. If you haven't found what you're looking for above, please narrow your search and try again.`, ephemeral: true })
                    }
                }
            } else {
                let resultEmbeds = []

                // Process results for result cards
                let processResults = (results) => {
                    results.forEach((result) => {
                        const newEmbed = new EmbedBuilder()
                        .setTitle(result.Name)
                        .setDescription(result.Type)
                        .addFields(
                            {name: 'Year', value: `${result.ProductionYear ?? 'n/a'}`, inline: true},
                            {name: 'Score', value: `⭐ ${roundNum(result.CommunityRating) ?? 'n/a'} 🍅 ${result.CriticRating ?? 'n/a'}`, inline: true},
                            {name: 'Rated', value: `${result.OfficialRating ?? 'n/a'}`, inline: true}
                            )
                        .setURL(`${jellyfinServerURL.value}/web/index.html#!/details?id=${result.Id}&serverId=${result.ServerId}`)
                        .setThumbnail(`${jellyfinServerURL.value}/Items/${result.Id}/Images/Primary`)

                        if (result.Genres.length > 0){
                            let genres = ''
                            result.Genres.forEach((genre, index) => {
                                genres += `${genre}`
                                if (index < (result.Genres.length - 1)){
                                    genres += ', '
                                }
                            })
                            newEmbed.addFields(
                                {name: 'Genres', value: genres}
                            )
                        }

                        newEmbed.addFields(
                            {name: 'Overview', value: (result.Overview.substring(0,1023) ?? 'n/a')}
                        )

                        if (result.ExternalUrls.length > 0){
                            let extUrls = ''
                            result.ExternalUrls.forEach((urlItem) => {
                                extUrls += hyperlink(`${urlItem.Name} `,`<${urlItem.Url}>`)
                            })
                            newEmbed.addFields(
                                {name: 'External Links', value: extUrls}
                            )
                        }

                        if (resultEmbeds.length < 10){
                            resultEmbeds.push(newEmbed)
                        }
                    })
                }
                // End processing results
                if (movies.length > 0){
                    processResults(movies)
                }

                if (shows.length > 0){
                    processResults(shows)
                }
                
                await interaction.reply({ embeds: resultEmbeds, content: `The following have been found on the Jellyfin server when searching for: **${searchCriteria}**`, ephemeral: true })

                if (totalResults > 10){
                    await interaction.followUp({ content: `Your search returned more than 10 results (${totalResults} total). If you haven't found what you're looking for above, please narrow your search and try again or include the **full** parameter as **True** to retrieve a larger, less fancy looking list.`, ephemeral: true })
                }
            }
        } else {
            await interaction.reply({ content: `Sorry, no results found on the Jellyfin server for **${searchCriteria}**. Maybe make a suggestion in the <#${suggestionsChannelId.value}> channel or by using the **/suggest** command!`, ephemeral: true });
        }
    }
};