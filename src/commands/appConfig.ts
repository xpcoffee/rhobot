/**
 * Type of data we expect from thie `app-config.yaml` file.
 * 
 * You must update this when adding new config to Rhobot.
 * 
 * We've consciously made the decision to make this a flat structure to favour keeping this user-facing interface as clean as possible.
 * This places more burden on the source code e.g. if multiple keys are needed for specific functionality to work the 
 * appropriate validations should be dealt with in the code.
 */
export interface AppConfig {
    /**
     * The secret token for the bot user - used to log into discord.
     */
    "discordToken": string;
    /**
     * The API key used to make calls against the Steam API.
     */
    "steamApiKey": string;
    /**
     * The DynamoDB table name used to store Rhobot data (currently only used in event command).
     */
    "dynamodbTable"?: string;
    /**
     * The AWS region in which DynamoDB table lives that's used to store Rhobot data (currently only used in event command).
     */
    "dynamodbRegion"?: string;
    /**
     * The Rhobot instance's command prefix - defaults to "!".
     */
    "commandPrefix"?: string;
    /**
     * Flag used to enable/disable the event command - defaults to `false`.
     */
    "enableEventCommand"?: boolean;
    /**
     * Flag used to enable/disable the sc2 command - defaults to `false`.
     */
    "enableSC2Command"?: boolean;
    /**
     * The client key used to auth against the BattleNet APIs.
     */
    "battlenetClientKey": string;
    /**
     * The secret key used to auth against the BattleNet APIs.
     */
    "battlenetClientSecret": string;
}