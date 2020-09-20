import { RhobotCommand } from ".";
import fetch from "node-fetch";
import { buildNestedCommand } from "./nestedCommand";

/**
* Builds the nested GW 2 command.
*/
export function buildCommand({
	prefix,
	guildWars2APIKey,
	commandEnabled = false,
}: {
	prefix: string;
	guildWars2APIKey?: string;
	commandEnabled?: boolean;
}): RhobotCommand | undefined {
	if (!commandEnabled) {
		console.log("[INFO] gw2 command disabled. To enable it please follow instructions in the README (TODO).");
		return undefined;
	}

	if (!(guildWars2APIKey)) {
		console.error(
			"[ERROR] Unable to create the gw2 command. " +
			"API key required. Please check your app-config."
		);
		return undefined;
	}

	const commands = {
		title: buildTitleCommand(),
		characters: buildCharactersCommand(guildWars2APIKey),
		wallet: buildCurrencyCommand(guildWars2APIKey),
	};
	return buildNestedCommand(prefix, "gw2", "Surface GW2 information.", commands);
}

function buildTitleCommand() {
	return {
		run: (message, parameters) => {

			if (parameters.length !== 1) {
				message.reply("Expecting one title id");
				return;
			}

			if (isNaN(Number(parameters[0]))) {
				message.reply("Invalid title id expected number");
				return;
			}

			getTitle(Number(parameters[0]))
				.then((titleJSONArr) => message.channel.send(titleJSONArr[0]["name"]))
				.catch((err) => message.reply(err));
		},
		help: "Show title name given title id",
	};
}

function buildCharactersCommand(guildWars2APIKey) {
	return {
		run: (message) => {
			getCharacters(guildWars2APIKey)
				.then((charNames) => message.channel.send(charNames))
				.catch((err) => message.reply(err));
		},
		help: "Show character names",
	};
}

function buildCurrencyCommand(guildWars2APIKey) {
	return {
		run: (message, parameters) => {

			const currencyName = parameters.join(" ");
			if (parameters.length === 0) {
				message.reply("Expecting currency name");
				return;
			}

			Promise.all([getCurrencies(), getWallet(guildWars2APIKey)])
				.then(([currencies, wallet]) => {
					const currency = currencies.find(walletItem => walletItem["name"] == currencyName);
					if (!currency) {
						message.reply("Invalid currency name");
						return;
					}
					const currencyid = currency["id"];
					const currencyInWallet = wallet.find(walletItem => walletItem["id"] === currencyid);
					const currencyAmount = currencyInWallet["value"];
					return currencyAmount;
				})
				.then((currencyAmount) => message.channel.send("You have " + currencyAmount + " " + currencyName + "/s"))
				.catch((err) => message.reply(err));
		},
		help: "Show how much of a currency you have",
	};
}

/**
* Get GW2 titles.
*/
async function getTitle(titleID) {
	const url = `https://api.guildwars2.com/v2/titles?ids=${titleID}`;
	return fetch(url).then((res) => {
		if (res.ok) {
			return res.json();
		}

		console.error(`Unable to fetch titles: ${res.status} ${res.statusText}`);
		throw "Unable to fetch titles info. Please contact the bot maintainer if issues persist.";
	});
}

/**
* Get GW2 characters.
*/
async function getCharacters(guildWars2APIKey) {
	const url = `https://api.guildwars2.com/v2/characters?access_token=${guildWars2APIKey}`;

	return fetch(url).then((res) => {
		if (res.ok) {
			return res.json();
		}

		console.error(`Unable to fetch characters: ${res.status} ${res.statusText}`);
		throw "Unable to fetch characters info. Please contact the bot maintainer if issues persist.";
	});
}


/**
* Get GW2 currency.
*/
async function getCurrencies() {
	const url = "https://api.guildwars2.com/v2/currencies?ids=all";

	return fetch(url).then((res) => {
		if (res.ok) {
			return res.json();
		}

		console.error(`Unable to fetch currencies: ${res.status} ${res.statusText}`);
		throw "Unable to fetch currencies info. Please contact the bot maintainer if issues persist.";
	});
}

/**
* Get GW2 wallet.
*/
async function getWallet(guildWars2APIKey) {
	const url = `https://api.guildwars2.com/v2/account/wallet?access_token=${guildWars2APIKey}`;

	return fetch(url).then((res) => {
		if (res.ok) {
			return res.json();
		}

		console.error(`Unable to fetch currencies: ${res.status} ${res.statusText}`);
		throw "Unable to fetch currencies info. Please contact the bot maintainer if issues persist.";
	});
}
