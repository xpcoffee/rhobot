import { Message } from "discord.js";

export { buildCommandHandler } from "./commandHandler";

/**
 * The basic form of a Rhobot command.
 *
 * Takes in a Discord Message and parameters and does some work.
 */
export interface RhobotCommand {
  run: (message: Message, parameters: string[]) => void;
  help: string;
}

export function formatErrors(errors: string[]): string {
  return "[ERROR] Could not successfully execute command:\n\n" + errors.map((error) => ` - ${error}`).join("\n");
}
