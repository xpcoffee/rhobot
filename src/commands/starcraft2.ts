import { BattleNetAuthResult, prepareAuthentication } from "../battlenet";

const DateTime = require("luxon").DateTime;
const fetch = require("node-fetch");
const { buildNestedCommand, formatErrors } = require("./nestedCommand");
const Discord = require('discord.js');

/**
 * Builds the nested Starcraft 2 command.
 */
const buildCommand = ({ prefix, battlenetClientKey, battlenetClientSecret, commandEnabled = false }: { prefix: string, battlenetClientKey?: string, battlenetClientSecret?: string, commandEnabled?: boolean }) => {
    if (!commandEnabled) {
        console.log("[INFO] sc2 command disabled. To enable it please follow instructions in the README.");
        return undefined;
    }

    if (!(battlenetClientKey && battlenetClientSecret)) {
        console.error("[ERROR] Unable to create the starcraft command. Both BattleNet client key and secret are required. Please check your app-config.");
        return undefined;
    }

    const authenticate = prepareAuthentication(battlenetClientKey, battlenetClientSecret);
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

            if (errors.length || !region) {
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
 * Returns the current StarCraft 2 season number.
 */
async function getSeason(credentials: BattleNetAuthResult, region: string) {
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

interface UnvalidatedParameters {
    errors: string[];
    region?: string;
}


function parseParameters(parameters: string[]) {
    const result: UnvalidatedParameters = { errors: [], region: "" };

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