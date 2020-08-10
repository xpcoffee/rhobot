import fetch from "node-fetch";
import { URLSearchParams } from "url";

export function prepareAuthentication(battlenetClientKey: string, battlenetClientSecret: string) {
  return async function authenticate(): Promise<AuthResult> {
    // https://develop.battle.net/documentation/guides/getting-started
    // curl -u {client_id}:{client_secret} -d grant_type=client_credentials https://us.battle.net/oauth/token

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    const credentials = Buffer.from(`${battlenetClientKey}:${battlenetClientSecret}`).toString("base64");

    const authenticationResult: BattleNetAuthResult = await fetch("https://us.battle.net/oauth/token", {
      method: "POST",
      body: params,
      headers: { Authorization: `Basic ${credentials}` },
    }).then((res) => res.json());

    return authenticationResult && authenticationResult.access_token
      ? ({ type: "success", authenticationResult } as AuthResult)
      : ({
          type: "failure",
          msg:
            "Unable to authenticate against the BattleNet API. " +
            "Reach out to the bot maintainer if these errors persist.",
        } as AuthResult);
  };
}

type AuthResult =
  | {
      type: "success";
      authenticationResult: BattleNetAuthResult;
    }
  | {
      type: "failure";
      msg: string;
    };

export interface BattleNetAuthResult {
  access_token: string;
}
