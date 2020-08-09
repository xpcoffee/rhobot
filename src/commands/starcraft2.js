const DateTime = require("luxon").DateTime;
const fetch = require("node-fetch");
const { buildNestedCommand, formatErrors } = require("./nestedCommand");
const BattleNet = require("./battlenet");
const Discord = require('discord.js');

/**
 * Builds the nested Starcraft 2 command.
 * 
 * @param {string} prefix - The command string prefix that a user needs to type before this one.
 * @param {string} battlenetClientKey - The API client key needed to call the BattleNet API.
 * @param {string} battlenetClientSecret - The API client secret needed to call the BattleNet API.
 */
const buildCommand = (prefix, battlenetClientKey, battlenetClientSecret) => {
    const authenticate = BattleNet.prepareAuthentication(battlenetClientKey, battlenetClientSecret);
    const commands = {
        "season": buildSeasonCommand(authenticate),
    };
    return buildNestedCommand(prefix, "sc2", "Surface Starcraft II information.", commands);
}

/**
 * Return information on the current season.
 */
function buildSeasonCommand(authenticate) {
    function formatSeason({ year, number, startDate, endDate }) {
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Starcraft II ${year} season ${number}`);
        embed.addField("Start date", DateTime.fromSeconds(parseInt(startDate)).toISODate());
        embed.addField("End date", DateTime.fromSeconds(parseInt(endDate)).toISODate());
        embed.setDescription("[More info on SCII Liquipedia](https://liquipedia.net/starcraft2)");
        return embed
    }

    return {
        run: (message, parameters) => {
            const { errors, region } = parseSeasonParameters(parameters);

            if (errors.length) {
                message.reply(formatErrors(errors))
                return;
            }

            authenticate()
                .then(res => getSeason(res.authenticationResult, region))
                .then(formatSeason)
                .then(season => message.channel.send(season))
                .catch(err => message.reply(err));
        },
        help: "Show info about the current season."
    };
}

/**
 * 
 * @param {*} credentials 
 * @param {*} region 
 * @return {Promise<string>} season
 */
async function getSeason(credentials, region) {
    const url = `https://${region}.api.blizzard.com/sc2/ladder/season/${REGIONS[region].regionId}?access_token=${credentials.access_token}`

    return fetch(url)
        .then(res => {
            if (res.ok) {
                return res.json();
            }

            console.error(`Unable to fetch season info: ${res.status} ${res.statusText}`);
            throw "Unable to fetch season info. Please contact the bot maintainer if issues persist."
        });
}

function parseSeasonParameters(parameters) {
    const result = parseParameters(parameters);

    const allowedRegions = Object.keys(REGIONS);

    if (!result.region) {
        result.errors.push("You must specify a region using `--region`")
    } else if (!allowedRegions.includes(result.region)) {
        result.errors.push(`\`--region\` must be one of ${allowedRegions.join(",")}`);
    }

    return result;
}


/**
 * The regions also have numbers. Why, I don't know...
 * https://develop.battle.net/documentation/starcraft-2/community-apis
 */
const REGIONS = {
    us: { regionId: "1" },
    eu: { regionId: "2" },
    ko: { regionId: "3" },
    tw: { regionId: "3" },
    cn: { regionId: "5" },
}

function parseParameters(parameters) {
    const result = { errors: [] };

    while (parameters.length) {
        const option = parameters.shift();
        switch (option) {
            case "--region":
                result.region = parameters.shift();
                break;
            default:
                result.errors.push(`Unrecognized option: ${option}`)
                break;
        }
    }

    return result;
}

module.exports = buildCommand;