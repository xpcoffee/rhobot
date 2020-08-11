# ρbot

A custom discord bot.

- [ρbot](#ρbot)
  - [Getting started](#getting-started)
  - [Enabling commands](#enabling-commands)
    - [steam](#steam)
    - [sc2](#sc2)
    - [event](#event)
  - [Additional info](#additional-info)

## Getting started

1. **Install [node](https://nodejs.org/en/download/)** if you haven't already.

2. **Clone this repository and pull the project dependencies:**

```bash
# in the root directory
npm install
```

3. **Create a new `app-config.yaml` file** in the root directory to hold the bot's credentials and - optionally - specify a command prefix.

```yaml
# creds.yaml
discordToken: <the token>
commandPrefix: <optional command prefix - defaults to !>
```

<dl>
<dt><code>discordToken</code></dt>
<dd>The Discord bot ClientKey. Get it by <a href="https://discordapp.com/developers/applications">setting up a Discord application and adding a bot</a>.</dd>
<dt><code>commandPrefix</code></dt>
<dd>Optional prefix for commands that the bot will use e.g. <code>!</code> will result in commands of the form <code>!help</code></dd>
</dl>

4. **To run the server locally** build and run the project:

```bash
npm run build
npm run start
```

## Enabling commands

### steam

The `steam` command allows users to surface Steam account information. This command is disabled by default.

If you want to enable this functionality, enable the command and add a Steam API key to `app-config.yaml`.

```yaml
enableSteamCommand: true
steamApiKey: <the key>
```

<dl>
<dt><code>steamApiKey</code></dt>
<dd>Steam API Key; get it by <a href="https://steamcommunity.com/dev">setting up an account and registering for an API key in the SteamCommunity</a>.</dd>
</dl>

### sc2

The `sc2` command allows users to surface Starcraft 2 information. This command is disabled by default.

If you want to enable this functionality, enable the command and add a BattleNet client key and secret to `app-config.yaml`.

```yaml
enableSC2Command: true
battlenetClientKey: <BattleNet client key>
battlenetClientSecret: <BattleNet client secret>
```

<dl>
<dt><code>battlenetClientKey</code> and <code>battlenetClientSecret</code></dt>
<dd><a href="https://develop.battle.net/documentation/guides/getting-started">BattleNet API credentials.</a> Get them by <a href="https://develop.battle.net/access">setting up a BattleNet dev account.</a></dd>
</dl>

### event

The `event` command allows users to create "event" objects in Discord which other users can sign up to.
This requires an AWS DynamoDB table to exist (the events are stored there) and is disabled by default.

If you want to enable this functionality:

1. Create an AWS DynamoDB table with a partition key called `type` (string).
2. Enable the command and add the DynamoDB table name and region to `app-config.yaml`.

```yaml
enableEventCommand: true
# DynamoDB details - only currently required for use with the event command
dynamodbTable: <DynamoDB table name>
dynamodbRegion: <DynamoDB table region>
```

<dl>
<dt><code>dynamodbTable</code> and <code>dynamodbRegion</code></dt>
<dd>The database used by Rhobot. To call against DynamoDB <b><i>it is expected that AWS credentials will be made available to the process</i></b>
(e.g. by previousy exporting environment variables or using an EC2 instance profile)</dd>
</dl>

3. Before starting Rhobot, export AWS environment variables which have READ and WRITE access to the table.

```bash
export AWS_ACCESS_KEY_ID=<your AWS public key>
export AWS_SECRET_ACCESS_KEY=<your AWS secret key>
npm run start
```

## Additional info

- [Rhobot Wiki](https://github.com/xpcoffee/rhobot/wiki)
- [Overview on how Discord bots work](https://xpcoffee.github.io/discord-bot)
