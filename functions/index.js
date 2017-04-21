"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var functions = require("firebase-functions");
var admin = require("firebase-admin");
var moment = require("moment");
var recastai = require("recastai");
var environment_1 = require("./environments/environment");
var _a = require('node-wit'), Wit = _a.Wit, log = _a.log;
var client = new Wit({ accessToken: environment_1.environment.wit });
var request = require('request');
admin.initializeApp(functions.config().firebase);
// initialize RecastAi Bot Buddy
var buddy = new recastai.Client(environment_1.environment.recast, 'en');
function sendPushNotification(uid, message) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenSnapshot, token, badgeRef, badge, payload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, admin.database().ref("/users/" + uid + "/pushToken").once('value')];
                case 1:
                    tokenSnapshot = _a.sent();
                    console.log("tokenSnapshot: " + tokenSnapshot.val());
                    if (!(tokenSnapshot !== null && tokenSnapshot !== undefined)) return [3 /*break*/, 3];
                    token = tokenSnapshot.val();
                    console.log("Push token: " + token);
                    badgeRef = admin.database().ref("/user/" + uid + "/config/phases/social/unreadMessages");
                    return [4 /*yield*/, badgeRef.once('value')];
                case 2:
                    badge = _a.sent();
                    badge = parseInt(badge.val(), 0) || 0;
                    console.log(badge);
                    badge = badge + 1;
                    badgeRef.set(badge);
                    console.log('badge: ' + badge);
                    payload = {
                        notification: {
                            title: 'Buddy has a new message...',
                            body: message,
                            icon: 'ic_stat_recess',
                            badge: badge.toString(),
                        }
                    };
                    return [2 /*return*/, admin.messaging().sendToDevice(token, payload)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function buddyReplies(uid, message) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Bot "Buddy" will reply');
                    // call RecastAi and respond to user
                    return [4 /*yield*/, buddy.textConverse(message).then(function (res) {
                            console.log('Response from Buddy:');
                            console.log(res);
                            var reply = res.reply();
                            if (reply !== null && reply !== undefined) {
                                admin.database().ref("/user/" + uid + "/conversation/").push({
                                    text: reply,
                                    author: 'buddy',
                                    type: 'bot',
                                    alias: 'Buddy',
                                    timestamp: moment().valueOf()
                                });
                            }
                        })];
                case 1:
                    // call RecastAi and respond to user
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function witReplies(uid, message) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Bot "Witty" will reply');
                    return [4 /*yield*/, client.converse("" + uid, message, {}).then(function (res) {
                            console.log('Response from Witty:');
                            console.log(JSON.stringify(res));
                            var reply = res;
                            if (reply !== null && reply !== undefined) {
                                admin.database().ref("/user/" + uid + "/conversation/").push({
                                    text: reply.msg,
                                    author: 'witty',
                                    type: 'bot',
                                    alias: 'Witty',
                                    timestamp: moment().valueOf()
                                });
                            }
                        }).catch(console.error)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function cleverReplies(uid, message) {
    return __awaiter(this, void 0, void 0, function () {
        var conversationRef, apiKey, cleverbotApi, conversationData, conversation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Bot "Smarty" will reply');
                    return [4 /*yield*/, admin.database().ref("/user/" + uid + "/data/conversation/smarty")];
                case 1:
                    conversationRef = _a.sent();
                    apiKey = environment_1.environment.cleverbot;
                    cleverbotApi = "http://www.cleverbot.com/getreply?key=" + apiKey;
                    cleverbotApi += "&input=" + message;
                    return [4 /*yield*/, conversationRef.once('value')];
                case 2:
                    conversationData = _a.sent();
                    conversation = conversationData.val();
                    if (conversation && conversation.cs) {
                        cleverbotApi += "&cs=" + conversationData.val().cs;
                    }
                    console.log("Calling " + cleverbotApi);
                    request(cleverbotApi, function (error, response, body) {
                        body = JSON.parse(body);
                        console.log(body);
                        console.log(body.output);
                        admin.database().ref("/user/" + uid + "/conversation/").push({
                            text: body.output,
                            author: 'smarty',
                            type: 'bot',
                            alias: 'Smarty',
                            timestamp: moment().valueOf()
                        });
                        conversationRef.set({
                            cs: body.cs
                        });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.reply = functions.database.ref("/user/{uid}/conversation/{cuid}").onWrite(function (event) { return __awaiter(_this, void 0, void 0, function () {
    var message, talkToBot, bid_1, botRef, bot, botRef, bot, botRef, bot;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(event);
                if (event.params.cuid === 'placeholder') {
                    return [2 /*return*/, 'placeholder, do nothing.'];
                }
                message = event.data.val();
                if (!(message.author !== event.params.uid)) return [3 /*break*/, 1];
                console.log("Message [" + message.text + "] from " + message.author + " to be send to user");
                return [2 /*return*/, sendPushNotification(event.params.uid, message.text)];
            case 1: return [4 /*yield*/, admin.database().ref("/user/" + event.params.uid + "/config/phases/social/settings/talkToBot").once('value')];
            case 2:
                talkToBot = _a.sent();
                bid_1 = talkToBot.val();
                console.log("Message [" + message.text + "] from " + message.author + " to be processed by bot [" + bid_1 + "]");
                if (!('buddy' === bid_1)) return [3 /*break*/, 4];
                botRef = admin.database().ref("/bots/" + bid_1 + "/");
                return [4 /*yield*/, botRef.once('value')];
            case 3:
                bot = _a.sent();
                if (!bot.val()) {
                    console.log("first initialize bot " + bid_1);
                    botRef.set({
                        type: 'bot',
                        subtype: 'recast.ai',
                        alias: 'Recast',
                        timestamp: moment().valueOf(),
                        users: { empty: true },
                    }).then(function () {
                        console.log("Bot " + bid_1 + " initialized.");
                    });
                }
                return [2 /*return*/, buddyReplies(event.params.uid, message.text)];
            case 4:
                if (!('witty' === bid_1)) return [3 /*break*/, 6];
                botRef = admin.database().ref("/bots/" + bid_1 + "/");
                return [4 /*yield*/, botRef.once('value')];
            case 5:
                bot = _a.sent();
                if (!bot.val()) {
                    console.log("first initialize bot " + bid_1);
                    botRef.set({
                        type: 'bot',
                        subtype: 'wit.ai',
                        alias: 'Witty',
                        timestamp: moment().valueOf(),
                        users: { empty: true },
                    }).then(function () {
                        console.log("Bot " + bid_1 + " initialized.");
                    });
                }
                return [2 /*return*/, witReplies(event.params.uid, message.text)];
            case 6:
                if (!('smarty' === bid_1)) return [3 /*break*/, 8];
                botRef = admin.database().ref("/bots/" + bid_1 + "/");
                return [4 /*yield*/, botRef.once('value')];
            case 7:
                bot = _a.sent();
                if (!bot.val()) {
                    console.log("first initialize bot " + bid_1);
                    botRef.set({
                        type: 'bot',
                        subtype: 'hybrid',
                        alias: 'Smarty',
                        timestamp: moment().valueOf(),
                        users: { empty: true },
                    }).then(function () {
                        console.log("Bot " + bid_1 + " initialized.");
                    });
                }
                return [2 /*return*/, cleverReplies(event.params.uid, message.text)];
            case 8: return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=index.js.map