const DateTime = require("luxon").DateTime;

// Return the time since the COVID-19 lockdown started in ZA.
const command = {
    run: message => {
        const LOCKDOWN_DATE = DateTime.utc(2020, 3, 26, 21, 59, 59);
        const diff = DateTime.utc().diff(LOCKDOWN_DATE, ["days", "hours", "minutes", "seconds"]);
        message.channel.send(`South Africa has been in COVID-19 lockdown for **${diff.days} days**, **${diff.hours} hours** and **${diff.minutes} minutes**.`);
    },
    help: "Show how long we've been in lockdown."
};

module.exports = command;