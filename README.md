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

3) **Create a new `creds.yaml` file** in the root directory to hold the bot's credentials.
```yaml
# creds.yaml
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
</dl>


4) **To run the server**, run the following from within the directory:
```bash
node src/
```

## Additional info

Wiki: https://github.com/xpcoffee/rhobot/wiki
Overview on how Discord bots work: https://xpcoffee.github.io/discord-bot
