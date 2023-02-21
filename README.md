# jellybot-discord-bot
A Dicord bot for use with a Jellyfin server.
 
Here is a sample Discord channel setup with marked channels that are required by the bot:
 
![image](https://user-images.githubusercontent.com/7452414/220355430-94f288d3-cec4-4165-8806-f285e9bba2dd.png)


You will need to have a config.json file in the same directory as main.js. Use the template below.

### CONFIG.JSON Template
```
{
    "discordAppToken": {
        "value": "",
        "comment": "This is retrieved from the Discord Developer Portal for the application."
    },
    "jellyfinServerURL": {
        "value": "https://jellyfin.host.com",
        "comment": "Syntax: https://jellyfin.host.com"
    },
    "jellyfinapi": {
        "value": "",
        "comment": "This API key can be generated in the Jellyfin site while logged in as an admin account."
    },
    "jellyfinUserId": {
        "value": "",
        "comment": "OPTIONAL - This is the user ID of an account for the searches. This is used if you want to limit access or use parental controls on the Jellybot's results. You can assign libraries directly to this user in Jellyfin. Retrieve the user ID by opening the user's properties and copy the userid value from the address bar. An admin account would have access to all libraries and circumvents parental controls."
    },
    "discordServerId": {
        "value": "",
        "comment": "Right-click the Discord server and click 'Copy ID'. Discord Developer Mode must be enabled."
    },
    "adminRoleId": {
        "value": "",
        "comment": "Right-click the role and click 'Copy ID'. Discord Developer Mode must be enabled."
    },
    "defaultMemberRoleId": {
        "value": "",
        "comment": "Right-click the role and click 'Copy ID'. Discord Developer Mode must be enabled."
    },
    "welcomeChannelId": {
        "value": "",
        "comment": "Right-click the channel and click 'Copy ID'. Discord Developer Mode must be enabled."
    },
    "generalChannelId": {
        "value": "",
        "comment": "Right-click the channel and click 'Copy ID'. Discord Developer Mode must be enabled."
    },
    "newMoviesChannelId": {
        "value": "",
        "comment": "Right-click the channel and click 'Copy ID'. Discord Developer Mode must be enabled."
    },
    "newShowsChannelId": {
        "value": "",
        "comment": "Right-click the channel and click 'Copy ID'. Discord Developer Mode must be enabled."
    },
    "newEpisodesChannelId": {
        "value": "",
        "comment": "Right-click the channel and click 'Copy ID'. Discord Developer Mode must be enabled."
    },
    "suggestionsChannelId": {
        "value": "",
        "comment": "Right-click the channel and click 'Copy ID'. Discord Developer Mode must be enabled."
    },
    "botTestingChannelId": {
        "value": "",
        "comment": "Right-click the channel and click 'Copy ID'. Discord Developer Mode must be enabled. This should only be visible to the administrator user."
    },
    "accountRequestsUserId": {
        "value": "",
        "comment": "Right-click the user and click 'Copy ID'. Discord Developer Mode must be enabled. This account is used to notify new users of who to contact to request a new Jellyfin account on your server."
    },
    "bannedWords": {
        "value": [],
        "comment": "This list contains words that will trigger the bot to delete a user's message and send them a DM to let them know what happened."
    }
}
```

### Links
[Discord Developer Portal](https://discord.com/developers/applications)
