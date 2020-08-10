# ρbot

This is the code for a simple discord bot.

## Getting started

1) **Install [node](https://nodejs.org/en/download/)** if you haven't already.

2) **Clone this repository and pull the project dependencies:**

```bash
# in the root directory
npm install
```

3) **Create a new `app-config.yaml` file** in the root directory to hold the bot's credentials.
```yaml
# creds.yaml
commandPrefix: <a command prefix other than "!" e.g. "$" to allow you to run your dev bot with different commands>
discordToken: <the token>
steamApiKey: <the key>
battlenetClientKey: <the key>
battlenetClientSecret: <the secret>
```
<dl>
<dt><code>discordToken</code></dt>
<dd>The Discord bot ClientKey. Get it by <a href="https://discordapp.com/developers/applications">setting up a Discord application and adding a bot</a>.</dd>
<dt><code>steamApiKey</code></dt>
<dd>Steam API Key; get it by <a href="https://steamcommunity.com/dev">setting up an account and registering for an API key in the SteamCommunity</a>.</dd>
<dt><code>battlenetClientKey</code> and <code>battlenetClientSecret</code></dt>
<dd><a href="https://develop.battle.net/documentation/guides/getting-started">BattleNet API credentials.</a> Get them by <a href="https://develop.battle.net/access">setting up a BattleNet dev account.</a></dd>
<dt><code>dynamodbTable</code> and <code>dynamodbRegion</code></dt>
<dd>The database used by Rhobot. To call against DynamoDB <b><i>it is expected that AWS credentials will be made available to the process</i></b>
(e.g. by previousy exporting environment variables or using an EC2 instance profile)</dd>
</dl>


4) **To run the server locally**, export AWS API credentials and point node at the `src` directory:
```bash
npm run build
npm run start
```

### The `event` command

The event command allows users to create "event" objects in Discord which other users can sign up to.
This requires an AWS DynamoDB table to exist (the events are stored there) and is disabled by default.

If you want to enable this functionality:

1) Create an AWS DynamoDB table with a partition key called `type` (string).
2) Enable the command and add the DynamoDB table name and region to `app-config.yaml`.
```yaml
enableEventCommand: true
# DynamoDB details - only currently required for use with the event command
dynamodbTable: <DynamoDB table name>
dynamodbRegion: <DynamoDB table region>
```
3) Before starting Rhobot, export AWS environment variables which have READ and WRITE access to the table.
```bash
export AWS_ACCESS_KEY_ID=<your AWS public key>
export AWS_SECRET_ACCESS_KEY=<your AWS secret key>
npm run start
```

## Additional info

- [Rhobot Wiki](https://github.com/xpcoffee/rhobot/wiki)
- [Overview on how Discord bots work](https://xpcoffee.github.io/discord-bot)
