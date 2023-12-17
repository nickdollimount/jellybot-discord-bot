const fs = require('node:fs')
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Routes, REST  } = require('discord.js')
const { discordAppToken, generalChannelId, botTestingChannelId, discordServerId, defaultMemberRoleId, welcomeChannelId, suggestionsChannelId, jellybotUserId, bannedWords } = require('./config/config.json')

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
        const guildObj = client.guilds.cache.get(discordServerId.value)
        const memberObj = await guildObj.members.fetch(userId)
        const roleObj = await guildObj.roles.fetch(defaultMemberRoleId.value)
        memberObj.roles.add(roleObj)

        client.channels.cache.get(generalChannelId.value).send(`Welcome to the party, <@${userId}>! You've been assigned the <@&${roleObj.id}> role. Please take a moment and read the <#${welcomeChannelId.value}> channel. I try to be useful so if you want to know how I can help, hit the / key to see what commands I have available. Be kind and enjoy your stay!`)

        // member.user.send('Welcome!')
    } catch (error) {
        console.log(error)
        // client.channels.cache.get(botTestingChannelId.value).send(error)
    }
}

const messageCreate_Handler = async (msg) => {
    // Remove messages from Suggestions Channel, only allowing Jellybot to post threads for suggestions. This is to keep the channel clean and organized.
    if (msg.channelId === suggestionsChannelId.value){
        if (msg.author.id != jellybotUserId.value){
            msg.delete()
        }
    }
}

const ready_Handler = async () => {
    try {
        const CLIENT_ID = client.user.id;

        const rest = new REST().setToken(discordAppToken.value);

        (async () => {
            console.log(`Started refreshing ${client.commands.length} application (/) commands.`);
            // try {
            //     console.log(`Started deleting ${client.commands.length} application (/) commands.`);
                
            //     const data = await rest.put(
            //         Routes.applicationGuildCommands(CLIENT_ID), { body: [] })
            //         .then(() => console.log(`Successfully deleted all global commands.`))
            // } catch (error) {
            //     console.error(error);
            // }

            try {
                console.log(`Started creating ${client.commands.length} application (/) commands.`);
        
                const data = await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, discordServerId.value), { body: client.commands })
                    .then(() => console.log(`Successfully created ${data.length} application (/) commands.`))
            } catch (error) {
                console.error(error);
            }
        })();

        await client.channels.cache.get(botTestingChannelId.value).send(`I'm here and ready to work!`)
        console.log('Jellybot is online!')
    } catch (error) {
        console.log(error)
    }
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
client.login(discordAppToken.value)