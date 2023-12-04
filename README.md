# jellybot-discord-bot
A Discord bot for use with a Jellyfin server.
 
Here is a sample Discord channel setup with marked channels that are required by the bot:
 
![image](https://user-images.githubusercontent.com/7452414/224669586-23462df2-9388-4cb4-a18a-4f349c0b8d4a.png)



You will need to have a config.json file in the config subdirectory. Use the template below.

### CONFIG.JSON Template
```
{
    "discordAppToken": {
        "value": "",
        "comment": "This is retrieved from the Discord Developers site for the application."
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
        "comment": "Right-click the channel and click 'Copy ID'. Discord Developer Mode must be enabled. The /suggest command uses this to post a thread with the suggestion made and react with but the custom approval and custom disapproval emojis."
    },
    "cuttingBoardChannelId": {
        "value": "",
        "comment": "Right-click the channel and click 'Copy ID'. Discord Developer Mode must be enabled. The /cuttingboard command takes a share URL from the Jellyfin site of a movie or show. Jellybot will post a new thread into the cutting board channel and react with but the custom approval and custom disapproval emojis."
    },
    "botTestingChannelId": {
        "value": "",
        "comment": "Right-click the channel and click 'Copy ID'. Discord Developer Mode must be enabled. This should only be visible to the administrator user."
    },
    "accountRequestsUserId": {
        "value": "",
        "comment": "Right-click the user and click 'Copy ID'. Discord Developer Mode must be enabled. This account is used to notify new users of who to contact to request a new Jellyfin account on your server."
    },
    "jellybotUserId": {
        "value": "",
        "comment": "Right-click the Jellybot user and click 'Copy ID'. This is used to skip auto message deletion in the Suggestions channel if it comes from the bot itself."
    },
    "customApproveEmojiName": {
        "value": "TheaterHappy",
        "comment": "Right-click the custom emoji and click 'Copy ID'. You can have a custom emoji in Discord or use an existing standard emoji."
    },
    "customDisapproveEmojiName": {
        "value": "TheaterSad",
        "comment": "Right-click the custom emoji and click 'Copy ID'. You can have a custom emoji in Discord or use an existing standard emoji."
    },
    "omdbAPIKey": {
        "value": "",
        "comment": "Receive a free API Key from https://www.omdbapi.com/. This is used to fetch the title and year of a suggestion made via an IMDB ID. You can receive a free OMDB API key from https://www.omdbapi.com/"
    },
    "bannedWords": {
        "value": [],
        "comment": "This list contains words that will trigger the bot to delete a user's message and send them a DM to let them know what happened. This functionality is no longer implemented as Discord provides AutoMod features built-in that handle this task."
    }
}
```

### docker-compose.yml
```
version: "3.1"
services:
  Jellybot:
    image: ndollimo/jellybot:latest
    container_name: jellybot
    working_dir: /usr/src/app
    volumes:
      - /local/path/to/config/directory:/usr/src/app/config
    restart: unless-stopped
```

### Links
[Jellybot Github Repository](https://github.com/nickdollimount/jellybot-discord-bot)

[Jellybot Docker Hub Repository](https://hub.docker.com/repository/docker/ndollimo/jellybot/general)

[Discord Developer Portal](https://discord.com/developers/applications)
