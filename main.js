const fs = require('node:fs')
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Routes, REST  } = require('discord.js')
const discordAppToken = process.env.discordAppToken,
generalChannelId = process.env.generalChannelId,
botTestingChannelId = process.env.botTestingChannelId,
discordServerId = process.env.discordServerId,
defaultMemberRoleId = process.env.defaultMemberRoleId,
welcomeChannelId = process.env.welcomeChannelId,
suggestionsChannelId = process.env.suggestionsChannelId,
jellybotUserId = process.env.jellybotUserId,
deleteCommands = process.env.deleteCommands,
clearSuggestionsFrequencyHours = process.env.clearSuggestionsFrequencyHours,
clearSuggestionsOlderThanDays = process.env.clearSuggestionsOlderThanDays

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
	],
})

// // Creating a collection for commands in client
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const guildMemberAdd_Handler = async (member) => {
    try {
        const userId = member.user.id
        const guildObj = client.guilds.cache.get(discordServerId)
        const memberObj = await guildObj.members.fetch(userId)
        const roleObj = await guildObj.roles.fetch(defaultMemberRoleId)
        memberObj.roles.add(roleObj)

        client.channels.cache.get(generalChannelId).send(`Welcome to the party, <@${userId}>! You've been assigned the <@&${roleObj.id}> role. Please take a moment and read the <#${welcomeChannelId}> channel. I try to be useful so if you want to know how I can help, hit the / key to see what commands I have available. Be kind and enjoy your stay!`)
    } catch (error) {
        console.log(error)
    }
}

const messageCreate_Handler = async (msg) => {
    // Remove messages from Suggestions Channel, only allowing Jellybot to post threads for suggestions. This is to keep the channel clean and organized.
    if (msg.channelId === suggestionsChannelId){
        if (msg.author.id != jellybotUserId){
            msg.delete()
        }
    }
}

const removeOldSuggestions = async (threadsArr, dateNow, threadAge) => {
    threadsArr.forEach(async element => {
        let threadId = element[1].id
        let threadDate = new Date(element[1].createdTimestamp)
        let threadName = element[1].name

        threadDate.setDate(threadDate.getDate() + threadAge)
        if (threadDate <= dateNow){
            await client.channels.cache.get(suggestionsChannelId).messages.fetch(threadId).then(async (message) => {await message.delete().catch(console.error)}).catch(console.error)
            await client.channels.cache.get(suggestionsChannelId).threads.fetch(threadId).then(async (thread) => {await thread.delete().catch(console.error)}).catch(console.error)
            await client.channels.cache.get(botTestingChannelId).send(`Removed old suggestion '${threadName}'.`).then(() => {console.log(`Removed old suggestion '${threadName}'.`)}).catch(console.error)
        }
    })
}

const setTimeoutAsync = async (callbackmethod, milliseconds) => {
    await new Promise((resolve, reject) => {
        setTimeout((timeoutCallback) => {
            try {
                timeoutCallback()
            } catch (error) {
                reject(error)
            }
            resolve(true)
        }, milliseconds, callbackmethod)
    })
}

const findOldSuggestions = async () => {
    console.log('[FindOldSuggestions] Start')
    let dateNow = new Date()

    // Active Threads
    await client.channels.cache.get(suggestionsChannelId).threads.fetchActive().then((foundThreads) => {
        removeOldSuggestions(Array.from(foundThreads.threads), dateNow, clearSuggestionsOlderThanDays)
    }).catch(console.error)
    

    // Archived Threads
    await client.channels.cache.get(suggestionsChannelId).threads.fetchArchived().then((foundThreads) => {
        removeOldSuggestions(Array.from(foundThreads.threads), dateNow, clearSuggestionsOlderThanDays)
    }).catch(console.error)
    console.log('[FindOldSuggestions] Complete')
}

const findOldSuggestionsLoop = async (intervalHours) => {
    while(true){
        await findOldSuggestions()
        await setTimeoutAsync(() => {}, (intervalHours*3600000))
    }
}

const ready_Handler = async () => {
    const CLIENT_ID = client.user.id;
    const rest = new REST().setToken(discordAppToken);

    if (deleteCommands === "true") {
        // Delete all commands
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, discordServerId), { body: [] })
        .then(() => console.log('Successfully deleted all guild commands.'))
        .catch(console.error)

        await rest.put(Routes.applicationCommands(clientId), { body: [] })
        .then(() => console.log('Successfully deleted all global commands.'))
        .catch(console.error);

        process.exit(1) // Exit application
    } else {
        // Register all commands.
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, discordServerId), { body: client.commands })
        .then(() => console.log(`Successfully created application (/) commands.`))
        .catch(console.error)
    }

    findOldSuggestionsLoop(clearSuggestionsFrequencyHours) // Clear old suggestions every 8 hours.

    await client.channels.cache.get(botTestingChannelId).send(`I'm here and ready to work!`).then(() => {console.log('Jellybot is online!')}).catch(console.error)
}

const begin = () => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            if (error) console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    });

    client.on('messageCreate', (msg) => {
        messageCreate_Handler(msg)
    })

    client.on('guildMemberAdd', async (member) => {
        guildMemberAdd_Handler(member)
    })

    client.once('ready', () => {
        ready_Handler()
    })
}

begin()

// Keep at the end of the file.
client.login(discordAppToken)