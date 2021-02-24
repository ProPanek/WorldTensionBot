const { spawn } = require("child_process");
const fs = require("fs");

const regexes = {
  ARGUMENTS: /\b\w*parse|mission|help|players|get-missions|say|kick|set-mission|restart-server|start-server|stop-server|reassign|ban|get-bans|remove-ban|ping\w*\b|-?[0-9]\d*(\.\d+)?|"(?:\\"|[^"])+"|\'(?:\\'|[^'])+'|\“(?:\\“|[^“])+“|(<[^]*[>$])/gm,
  COMMANDS: /\b\w*parse|mission|help|players|get-missions|say|kick|set-mission|restart-server|start-server|stop-server|reassign|ban|get-bans|remove-ban|ping\w*\b/gm,
  CONTENT: /"(?:\\"|[^"])+"|\'(?:\\'|[^'])+'|\“(?:\\“|[^“])+“/gm,
  NUMBER: /^(?!.*<@)-?[0-9]\d*(\.\d+)?/gm,
  MENTION: /(<[^]*[>$])/gm,
  EXTRACT_MENTION_ID: /(?<=<@!)(.*)(?=>)/gm,
  LINK: /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/gm,
  LOWERCASE: /^[A-Z0-9-+_!@#$%^&*;:{}\\/=|()~<>.,?ĄĆĘŁŃÓŚŹŻ\[\]"'`]+$|(\:(.*?)\:)|(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gm,
  MESSAGE: /"(?:\\"|[^"])+"|\'(?:\\'|[^'])+'|\“(?:\\“|[^“])+“/gm,
  IPS: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/gm
};

function filteredRegexes(array) {
  return Object.keys(regexes)
    .filter(key => array.includes(key))
    .reduce((obj, key) => {
      obj[key] = regexes[key];
      return obj;
    }, {});
}

function checkIfDM(receivedMessage) {
  return receivedMessage.channel.type === "dm";
}

function validatePermissions(receivedMessage) {
  if (!checkIfDM(receivedMessage)) {
    return !!receivedMessage.member._roles.find(role =>
      process.env.BOT_PERMISSIONS_ROLES.includes(role)
    );
  }
}

function validateAdmin(receivedMessage) {
  if (!checkIfDM(receivedMessage)) {
    return !!receivedMessage.member._roles.find(role =>
      process.env.BOT_ADMIN_ROLES.includes(role)
    );
  }
}

function stopServer() {
  fs.readFile("./arma3.pid", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(data);
    if (require("is-running")(parseInt(data))) {
      process.kill(parseInt(data));
    }
  });
}

function startServer() {
  const out = fs.openSync("./out.log", "a");
  const err = fs.openSync("./out.log", "a");
  spawn("./a3runscript.sh", [], {
    detached: true,
    stdio: ["ignore", out, err]
  }).unref();
}

function restartServer() {
  fs.readFile("./arma3.pid", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(data);
    if (require("is-running")(parseInt(data))) {
      process.kill(parseInt(data));
    } else {
      const out = fs.openSync("./out.log", "a");
      const err = fs.openSync("./out.log", "a");
      spawn("./a3runscript.sh", [], {
        detached: true,
        stdio: ["ignore", out, err]
      }).unref();
    }
  });
}

function checkIfServerIsOn() {
  fs.readFile("./arma3.pid", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    return !!require("is-running")(parseInt(data));
  });
}

module.exports = {
  regexes,
  checkIfDM,
  validatePermissions,
  validateAdmin,
  restartServer,
  stopServer,
  startServer,
  checkIfServerIsOn
};
