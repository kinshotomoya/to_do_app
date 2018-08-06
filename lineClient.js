const line = require('@line/bot-sdk');
const lineConfig = require('./lineConfig');
const client = new line.Client(lineConfig);

module.exports = client;
