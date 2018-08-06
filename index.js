const express = require('express');
const to_to_json = require('./to_do.json');
const line = require('@line/bot-sdk');
const client = require('./lineClient');
const lineConfig = require('./lineConfig');
const cron = require('node-cron'); //バッチ処理
const fs = require('fs');
const weeklyday = ['sunday', 'monday', 'tuseday', 'wednseday', 'thurseday', 'friday', 'saturday'];

const app = express();

batchpushMessage();

app.post('/webhook', line.middleware(lineConfig), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

function batchpushMessage() {
    //userIDをjsonファイルから取得する
    var todo_json_file_data = JSON.parse(fs.readFileSync('to_do.json'));
    const userIds = todo_json_file_data.map(json => json.id);
    cron.schedule('0 */4 * * *', function () {
        console.log(userIds);
        userIds.forEach(id => {
            if (id != undefined || id != "ssss") {
                client.getProfile(id).then((profile) => {;
                    let userName = profile.displayName;
                    console.log(`${userName}にバッチ処理`);
                    let todo = getToDoList(userName);
                    let message = `${userName}さんの今日することは、${todo} です.`;
                    pushMessage(id, message);
                });
            };
        });
    });
};

function handleEvent(event) {
    if (event.type == 'follow') {
        const userID = event.source.userId;
        getProfile(userID, event);
    }
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }
    const replyMessage = "ごめんね。まだ学習中だから返信できないの。。。これからupdateしていくね。";
    replyMessageToUser(event, replyMessage);
}

function getProfile(userID, event) {
    client.getProfile(userID).then((profile) => {
        writeJsonData(profile, event, userID);
    });
};

// ユーザーid名前のjson形式のファイルを作成する
// user_data.jsonというファイル名
function writeJsonData(profile, event, userID) {
    console.log(profile.userId);
    const userName = profile.displayName;
    // TODO: JSONファイルを更新するようにしないといけない
    // const data = {
    //     id: profile.userId,
    //     name: userName
    // };
    // fs.writeFileSync('user.json', JSON.stringify(data, null, '')); //user情報をjsonファイルで保存
    const replyMessage = `${userName}さん、友達追加ありがとう！${userName}さんが今日することを送るね。`
    replyMessageToUser(event, replyMessage);
    const toDoOfTheDay = getToDoList(userName);
    var replyToDoMessage = `${userName}さんが今日することは、${toDoOfTheDay}だよ。よろしくね。`;
    pushMessage(userID, replyToDoMessage);

};

function getToDoList(userName) {
    const datetime = new Date();
    const date = datetime.getDay(); //数値
    const day = weeklyday[date];
    if (userName == 'きんしょー') {
        var toDoOfTheDay = to_to_json[0].todo[day];
    } else if (userName == 'きんしょーなな') {
        var toDoOfTheDay = to_to_json[1].todo[day];
    } else if (userName == 'kinn') {
        var toDoOfTheDay = to_to_json[2].todo[day];
    } else {
        var toDoOfTheDay = to_to_json[3].todo[day];
    }
    return toDoOfTheDay;
};

function replyMessageToUser(event, replyMessage) {
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: replyMessage
    });
};

function pushMessage(userId, message) {
    client.pushMessage(userId, {
        type: 'text',
        text: message
    });
};

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});