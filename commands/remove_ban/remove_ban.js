const { validateAdmin } = require("../../helpers/helpers");
module.exports.removeBan = async function(
  receivedMessage,
  bnode,
  messageArguments
) {
  const uid = messageArguments[0];

  if (validateAdmin(receivedMessage)) {
    if (isNaN(uid)) {
      return await receivedMessage.channel.send(
        `Komenda jest źle wpisana! (id usera)`
      );
    }

    bnode.sendCommand(`removeBan ${uid}`);
    await receivedMessage.channel.send(
      `Ban dla usera pod nr ${uid} został zdjęty`
    );
  } else {
    await receivedMessage.channel.send(
      `Nie masz uprawnień do korzystania z tego!`
    );
  }
};
