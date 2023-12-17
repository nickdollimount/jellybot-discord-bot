# jellybot-discord-bot
A Discord bot for use with a Jellyfin server.
 
Here is a sample Discord channel setup with marked channels that are required by the bot; the #new-movies, #new-series and #new-episodes channels actually have webhooks configured inside of Jellyfin to post directly to them (more on that below):
 
![image](https://user-images.githubusercontent.com/7452414/224669586-23462df2-9388-4cb4-a18a-4f349c0b8d4a.png)

When you're setting up your Jellybot in the Discord Developer Portal, enable the following:
<img width="1698" alt="image" src="https://github.com/nickdollimount/jellybot-discord-bot/assets/7452414/6817d0d9-e2f3-4b22-a660-51747e42ad4e">

You'll have to create a bot link using the following permissions (URL is generated below this list; copy it and navigate to it to add the bot to your Discord server):
<img width="1692" alt="image" src="https://github.com/nickdollimount/jellybot-discord-bot/assets/7452414/05927bdc-4110-4d7d-81d8-c7e286215fd9">

Once the bot is added to your discord server, provide it access to the #general, #suggestions, #cutting-board and #bot-testing channels. New user welcome message is posted in #general. New suggestions are posted in #suggestions. Items added to the cutting board are posted to #cutting-board. The bot startup message and suggestions with user information are added to the #bot-testing channel.  
  
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

### Jellfin Webhooks for Discord

For each of the following, create a new webhook integration in the Discord server and copy webhook URL to use in the Jellyfin webhook configurations.

<img width="534" alt="image" src="https://github.com/nickdollimount/jellybot-discord-bot/assets/7452414/614a8774-da54-4696-8b1f-d47d26bd37c0">

Add the Webhook plugin if it isn't already added then open its settings to create 3 new **Discord Destination** webhooks.

**New Movies to Discord**  
Notification Type: Item Added  
Item Type: Movies  
Template:
```
{
    "content": "{{MentionType}}",
    "avatar_url": "{{AvatarUrl}}",
    "username": "{{{BotUsername}}}",
    "embeds": [
        {
            "color": "{{EmbedColor}}",
            "footer": {
                "text": "From {{{ServerName}}}",
                "icon_url": "{{AvatarUrl}}"
            },
            "url": "{{ServerUrl}}/web/index.html#!/details?id={{ItemId}}&serverId={{ServerId}}",
            {{#if_equals ItemType 'Season'}}
                "title": "{{{SeriesName}}} {{{Name}}} has been added to {{{ServerName}}}",
            {{else}}
                {{#if_equals ItemType 'Episode'}}
                    "title": "{{{SeriesName}}} S{{SeasonNumber00}}E{{EpisodeNumber00}} {{{Name}}} has been added to {{{ServerName}}}",
                {{else}}
                    "title": "{{{Name}}} ({{Year}}) has been added to {{{ServerName}}}",
                {{/if_equals}}
            {{/if_equals}}
            
            {{~#if_exist Overview~}}
            "fields": [
                {
                    "name": "Overview",
                    "value": "{{{Overview}}}"
                }
            ],
            {{~/if_exist~}}
            "thumbnail":{
                "url": "{{ServerUrl}}/Items/{{ItemId}}/Images/Primary"
            },
            "description": "External Links:\n
            {{~#if_exist Provider_imdb~}}
            [IMDb](https://www.imdb.com/title/{{Provider_imdb}}/)\n
            {{~/if_exist~}}
            {{~#if_exist Provider_tmdb~}}
                {{~#if_equals ItemType 'Movie'~}}
                    [TMDb](https://www.themoviedb.org/movie/{{Provider_tmdb}})\n
                {{~else~}}
                    [TMDb](https://www.themoviedb.org/tv/{{Provider_tmdb}})\n
                {{~/if_equals~}}
            {{~/if_exist~}}
            {{~#if_exist Provider_musicbrainzartist~}}
                [MusicBrainz](https://musicbrainz.org/artist/{{Provider_musicbrainzartist}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_audiodbartist~}}
                [AudioDb](https://theaudiodb.com/artist/{{Provider_audiodbartist}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_musicbrainztrack~}}
                [MusicBrainz Track](https://musicbrainz.org/track/{{Provider_musicbrainztrack}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_musicbrainzalbum~}}
                [MusicBrainz Album](https://musicbrainz.org/release/{{Provider_musicbrainzalbum}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_theaudiodbalbum~}}
                [TADb Album](https://theaudiodb.com/album/{{Provider_theaudiodbalbum}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_tvmaze~}}
                {{~#if_equals ItemType 'Episode'~}}
                    [TVMaze](https://www.tvmaze.com/episodes/{{Provider_tvmaze}})\n    
                {{~/if_equals~}}
                {{~#if_equals ItemType 'Series'~}}
                    [TVMaze](https://www.tvmaze.com/shows/{{Provider_tvmaze}})\n
                {{~/if_equals~}}                
            {{~/if_exist~}}"
        }
    ]
}
```
  
**New Episodes to Discord**  
Notification Type: Item Added  
Item Type: Episodes, Season  
Template:  
```
{
    "content": "{{MentionType}}",
    "avatar_url": "{{AvatarUrl}}",
    "username": "{{{BotUsername}}}",
    "embeds": [
        {
            "color": "{{EmbedColor}}",
            "footer": {
                "text": "From {{{ServerName}}}",
                "icon_url": "{{AvatarUrl}}"
            },
            "url": "{{ServerUrl}}/web/index.html#!/details?id={{ItemId}}&serverId={{ServerId}}",
            {{#if_equals ItemType 'Season'}}
                "title": "{{{SeriesName}}} {{{Name}}} has been added to {{{ServerName}}}",
            {{else}}
                {{#if_equals ItemType 'Episode'}}
                    "title": "{{{SeriesName}}} S{{SeasonNumber00}}E{{EpisodeNumber00}} {{{Name}}} has been added to {{{ServerName}}}",
                {{else}}
                    "title": "{{{Name}}} ({{Year}}) has been added to {{{ServerName}}}",
                {{/if_equals}}
            {{/if_equals}}
            
            {{~#if_exist Overview~}}
            "fields": [
                {
                    "name": "Overview",
                    "value": "{{{Overview}}}"
                }
            ],
            {{~/if_exist~}}
            "thumbnail":{
                "url": "{{ServerUrl}}/Items/{{ItemId}}/Images/Primary"
            },
            "description": "External Links:\n
            {{~#if_exist Provider_imdb~}}
            [IMDb](https://www.imdb.com/title/{{Provider_imdb}}/)\n
            {{~/if_exist~}}
            {{~#if_exist Provider_tmdb~}}
                {{~#if_equals ItemType 'Movie'~}}
                    [TMDb](https://www.themoviedb.org/movie/{{Provider_tmdb}})\n
                {{~else~}}
                    [TMDb](https://www.themoviedb.org/tv/{{Provider_tmdb}})\n
                {{~/if_equals~}}
            {{~/if_exist~}}
            {{~#if_exist Provider_musicbrainzartist~}}
                [MusicBrainz](https://musicbrainz.org/artist/{{Provider_musicbrainzartist}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_audiodbartist~}}
                [AudioDb](https://theaudiodb.com/artist/{{Provider_audiodbartist}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_musicbrainztrack~}}
                [MusicBrainz Track](https://musicbrainz.org/track/{{Provider_musicbrainztrack}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_musicbrainzalbum~}}
                [MusicBrainz Album](https://musicbrainz.org/release/{{Provider_musicbrainzalbum}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_theaudiodbalbum~}}
                [TADb Album](https://theaudiodb.com/album/{{Provider_theaudiodbalbum}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_tvmaze~}}
                {{~#if_equals ItemType 'Episode'~}}
                    [TVMaze](https://www.tvmaze.com/episodes/{{Provider_tvmaze}})\n    
                {{~/if_equals~}}
                {{~#if_equals ItemType 'Series'~}}
                    [TVMaze](https://www.tvmaze.com/shows/{{Provider_tvmaze}})\n
                {{~/if_equals~}}                
            {{~/if_exist~}}"
        }
    ]
}
```
  
**New Shows to Discord**  
Notification Type: Item Added  
Item Type: Season, Series  
Template:
```
{
    "content": "{{MentionType}}",
    "avatar_url": "{{AvatarUrl}}",
    "username": "{{{BotUsername}}}",
    "embeds": [
        {
            "color": "{{EmbedColor}}",
            "footer": {
                "text": "From {{{ServerName}}}",
                "icon_url": "{{AvatarUrl}}"
            },
            "url": "{{ServerUrl}}/web/index.html#!/details?id={{ItemId}}&serverId={{ServerId}}",
            {{#if_equals ItemType 'Season'}}
                "title": "{{{SeriesName}}} {{{Name}}} has been added to {{{ServerName}}}",
            {{else}}
                {{#if_equals ItemType 'Episode'}}
                    "title": "{{{SeriesName}}} S{{SeasonNumber00}}E{{EpisodeNumber00}} {{{Name}}} has been added to {{{ServerName}}}",
                {{else}}
                    "title": "{{{Name}}} ({{Year}}) has been added to {{{ServerName}}}",
                {{/if_equals}}
            {{/if_equals}}
            
            {{~#if_exist Overview~}}
            "fields": [
                {
                    "name": "Overview",
                    "value": "{{{Overview}}}"
                }
            ],
            {{~/if_exist~}}
            "thumbnail":{
                "url": "{{ServerUrl}}/Items/{{ItemId}}/Images/Primary"
            },
            "description": "External Links:\n
            {{~#if_exist Provider_imdb~}}
            [IMDb](https://www.imdb.com/title/{{Provider_imdb}}/)\n
            {{~/if_exist~}}
            {{~#if_exist Provider_tmdb~}}
                {{~#if_equals ItemType 'Movie'~}}
                    [TMDb](https://www.themoviedb.org/movie/{{Provider_tmdb}})\n
                {{~else~}}
                    [TMDb](https://www.themoviedb.org/tv/{{Provider_tmdb}})\n
                {{~/if_equals~}}
            {{~/if_exist~}}
            {{~#if_exist Provider_musicbrainzartist~}}
                [MusicBrainz](https://musicbrainz.org/artist/{{Provider_musicbrainzartist}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_audiodbartist~}}
                [AudioDb](https://theaudiodb.com/artist/{{Provider_audiodbartist}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_musicbrainztrack~}}
                [MusicBrainz Track](https://musicbrainz.org/track/{{Provider_musicbrainztrack}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_musicbrainzalbum~}}
                [MusicBrainz Album](https://musicbrainz.org/release/{{Provider_musicbrainzalbum}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_theaudiodbalbum~}}
                [TADb Album](https://theaudiodb.com/album/{{Provider_theaudiodbalbum}})\n
            {{~/if_exist~}}
            {{~#if_exist Provider_tvmaze~}}
                {{~#if_equals ItemType 'Episode'~}}
                    [TVMaze](https://www.tvmaze.com/episodes/{{Provider_tvmaze}})\n    
                {{~/if_equals~}}
                {{~#if_equals ItemType 'Series'~}}
                    [TVMaze](https://www.tvmaze.com/shows/{{Provider_tvmaze}})\n
                {{~/if_equals~}}                
            {{~/if_exist~}}"
        }
    ]
}
```

### Links
[Jellybot Github Repository](https://github.com/nickdollimount/jellybot-discord-bot)

[Jellybot Docker Hub Repository](https://hub.docker.com/repository/docker/ndollimo/jellybot/general)

[Discord Developer Portal](https://discord.com/developers/applications)
