# ρbot

![](https://codebuild.us-east-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoib0I3Znd0WGhPZjV3MkZzNUpBS3pQTFNtbFBoMlBUZmJVT3dGajhxK21KaCtqKzlES2grWjBJV1U5VGQ2Q2Y3V0tRMjkzeVhMYWhQZVdjT2dEMWdudjBZPSIsIml2UGFyYW1ldGVyU3BlYyI6IkxzNnhzcXBoVXRqa1JFMGkiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

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
dynamodbTable: <DynamoDB table name>
dynamodbRegion: <DynamoDB table region>
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
export AWS_ACCESS_KEY_ID=<your AWS public key>
export AWS_SECRET_ACCESS_KEY=<your AWS secret key>
npm run build
npm run start
```

## Additional info

- [Rhobot Wiki](https://github.com/xpcoffee/rhobot/wiki)
- [Overview on how Discord bots work](https://xpcoffee.github.io/discord-bot)
