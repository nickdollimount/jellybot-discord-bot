const fs = require('node:fs')
const path = require('node:path')
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

const utils = require('./utils.js')

// // Creating a collection for commands in client
client.commands = new Collection()
const commands = []

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder)
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = require(filePath)
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
			commands.push(command.data.toJSON())
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
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

const ready_Handler = async () => {
    const CLIENT_ID = client.user.id
    const rest = new REST().setToken(discordAppToken)

    if (deleteCommands === "true") {
        // Delete all commands
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, discordServerId), { body: [] })
        .then(() => console.log('Successfully deleted all guild commands.'))
        .catch(console.error)

        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] })
        .then(() => console.log('Successfully deleted all global commands.'))
        .catch(console.error)

        process.exit(1) // Exit application
    }

    // Register all commands.
    const data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, discordServerId), { body: commands })
    .then(() => console.log(`Successfully created application (/) commands.`))
    .catch(console.error)

    await client.channels.cache.get(botTestingChannelId).send(`I'm here and ready to work!`).then(() => {console.log('Jellybot is online!')}).catch(console.error)

    utils.messageCleanup(client, suggestionsChannelId, clearSuggestionsFrequencyHours, clearSuggestionsOlderThanDays)
}

const begin = () => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return
        const command = client.commands.get(interaction.commandName)
        if (!command) return
        try {
            await command.execute(interaction)
        } catch (error) {
            if (error) console.error(error)
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        }
    })

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