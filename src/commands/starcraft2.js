const DateTime = require("luxon").DateTime;
const fetch = require("node-fetch");
const { buildCommand: buildNestedCommand } = require("./nestedCommand");
const BattleNet = require("./battlenet");

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
    function formatSeason(result) {
        return `**Starcraft II ${result.year} season ${result.number}**
        Start date: ${DateTime.fromSeconds(parseInt(result.startDate)).toISODate()}
        End date: ${DateTime.fromSeconds(parseInt(result.endDate)).toISODate()} `
    }

    return {
        run: (message, parameters) => {
            prepareStarcraftParameters(parameters, ["--region"], authenticate)
                .then(result => {
                    if (result.type !== "success") {
                        message.channel.send(result.msg)
                        return;
                    }

                    getSeason(result.authenticationResult, result.region)
                        .then(result => {
                            message.channel.send(result.type === "error" ? result.msg : formatSeason(result))
                        })
                });
        },
        help: "Show info about the current season."
    };
}

async function getSeason(credentials, region) {
    const url = `https://${region}.api.blizzard.com/sc2/ladder/season/${REGIONS[region].regionId}?access_token=${credentials.access_token}`

    return fetch(url)
        .then(res => {
            if (res.ok) {
                return res.json();
            }

            console.error(`Unable to fetch season info: ${res.status} ${res.statusText}`);
            return Promise.reject({ type: "error", msg: "Unable to fetch season info. Contact the bot maintainer if issues persist." });
        });
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

// TODO: this feels clunky - need to rethink paramater validation for subcommands
function parseParameters(parameters, requiredParams) {
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

    if (requiredParams.includes("--region") && result.region === undefined || !Object.keys(REGIONS).includes(result.region)) {
        result.errors.push(`'--region' must be one of: ${Object.keys(REGIONS).join(",")}`);
    }

    return result;
}

async function prepareStarcraftParameters(parameters, requiredParams, authenticate) {
    const options = parseParameters(parameters, requiredParams);

    if (options.errors.length) {
        return { type: "error", msg: `**Issues found with command:**\r${options.errors.join("\r")}` };
    }

    const response = await authenticate();
    if (response.type !== "success") {
        return { type: "error", msg: response.msg };
    }

    return {
        type: "success",
        authenticationResult: response.authenticationResult,
        ...options
    };
}

module.exports = buildCommand;