// Additional information about ρbot
const command = {
    run: message => {
        message.channel.send("Source code can be found at https://github.com/xpcoffee/rhobot");
    },
    help: "Show info about ρbot."
}

module.exports = command;