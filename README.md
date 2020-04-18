# ρbot

![](https://codebuild.us-east-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoib0I3Znd0WGhPZjV3MkZzNUpBS3pQTFNtbFBoMlBUZmJVT3dGajhxK21KaCtqKzlES2grWjBJV1U5VGQ2Q2Y3V0tRMjkzeVhMYWhQZVdjT2dEMWdudjBZPSIsIml2UGFyYW1ldGVyU3BlYyI6IkxzNnhzcXBoVXRqa1JFMGkiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

This is the code for a simple discord bot.

## Getting started

Ensure you have [node](https://nodejs.org/en/download/) installed.

Clone the repository and run to pull the project dependencies:

```bash
npm install
```

Create a new `creds.yaml` file in the directory to hold the bot's token. To get the token either [reach out to me](https://github.com/xpcoffee) or [set up your own Discord bot account](https://discordapp.com/developers/applications).

```yaml
# creds.yaml
discordToken: <the token>
```

To run the server, run the following from within the directory:

```bash
node src/
```