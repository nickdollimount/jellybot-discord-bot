const fs = require('node:fs')
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

const slashcommands = []; // Gets filled with dynamically the available command names and their description. This gets passed to the !commands handler.

// Creating a collection for commands in client
client.slashcommands = new Collection();
const slashCommandFiles = fs.readdirSync('./slashcommands').filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
    const command = require(`./slashcommands/${file}`);
    slashcommands.push(command.data.toJSON());
    client.slashcommands.set(command.data.name, command);
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

// const moderate_Message = (msg) => {
//     bannedWords.value.forEach((word) => {
//         if (msg.content.toLowerCase().includes(word)) {
//             msg.delete()
//             return true
//         }
//     })
    
//     return false
// }

const messageCreate_Handler = async (msg) => {
    // Moderate message
    // if (moderate_Message(msg)) { return }

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
            try {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID, discordServerId.value), {
                        body: slashcommands
                    },
                );
                console.log('Successfully registered application commands for development guild');
            } catch (error) {
                if (error) console.error(error);
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
        const command = client.slashcommands.get(interaction.commandName);
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