const CryptoJS = require("crypto-js");

const SECRET = process.env.CHAT_SECRET;

exports.encrypt = (text) => CryptoJS.AES.encrypt(text, SECRET).toString();

exports.decrypt = (cipher) =>
  CryptoJS.AES.decrypt(cipher, SECRET).toString(CryptoJS.enc.Utf8);
