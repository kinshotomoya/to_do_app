require('dotenv').config(); //環境変数の読み込み
const lineConfig = {
    channelSecret: process.env.LINE_CHANNEL_SECRET_TOKE,
    channelAccessToken: process.env.LINE_CHANNEL__TOKE
};

module.exports = lineConfig;