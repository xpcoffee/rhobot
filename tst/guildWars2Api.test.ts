import * as Discord from "discord.js";
import { AppConfig } from "../src/appConfig";
import { getApiKey, USERID_KEY_ARRAY_DELIMITER, USERID_KEY_DELIMITER } from "../src/guildWars2Api";

describe("getApiKey", () => {
  const userA = "userA";
  const keyA = "foo";

  const userB = "userB";
  const keyB = "bar";

  const configString = [`${userA}${USERID_KEY_DELIMITER}${keyA}`, `${userB}${USERID_KEY_DELIMITER}${keyB}`].join(
    USERID_KEY_ARRAY_DELIMITER
  );

  const config: Partial<AppConfig> = { guildWars2ApiKeys: configString };

  it("returns a key if it exists", () => {
    expect(getApiKey({ id: userA } as Discord.User, config as AppConfig)).toEqual(keyA);
    expect(getApiKey({ id: userB } as Discord.User, config as AppConfig)).toEqual(keyB);
  });

  it("returns a undefined if a key does not exist", () => {
    expect(getApiKey({ id: "baz" } as Discord.User, config as AppConfig)).toBe(undefined);
  });
});
