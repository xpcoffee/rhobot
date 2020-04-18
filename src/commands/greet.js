// Say hi
const command = {
    run: message => message.channel.send("Hi there!"),
    help: "Say hi."
};

module.exports = command;
