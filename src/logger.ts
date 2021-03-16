import { createLogger, format, transports } from "winston";

export const LOGGER = createLogger({
  level: "info",
  format: format.json(),
  transports: [new transports.Console({ format: format.simple() })],
});
