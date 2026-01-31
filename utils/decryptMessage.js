const { decrypt } = require("./encrypt");

exports.decryptMessage = (msg) => {
  if (!msg) return msg;

  const m = msg.toObject ? msg.toObject() : msg;

  if (m.text) {
    m.text = decrypt(m.text);
  }

  return m;
};
