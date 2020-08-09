const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

function prepareAuthentication(battlenetClientKey, battlenetClientSecret) {
    return async function authenticate() {
        // https://develop.battle.net/documentation/guides/getting-started
        // curl -u {client_id}:{client_secret} -d grant_type=client_credentials https://us.battle.net/oauth/token

        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");
        const credentials = Buffer.from(`${battlenetClientKey}:${battlenetClientSecret}`).toString("base64");

        const authenticationResult = await fetch(
            "https://us.battle.net/oauth/token",
            {
                method: "POST",
                body: params,
                headers: {
                    "Authorization": `Basic ${credentials}`
                }
            }
        ).then(res => res.json())

        return authenticationResult && authenticationResult.access_token
            ? { type: "success", authenticationResult }
            : { type: "failure", msg: `Unable to authenticate against the BattleNet API. Reach out to the bot maintainer if these errors persist.` };
    }
}

module.exports = {
    prepareAuthentication
};