import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import * as recastai from 'recastai';

import {environment} from './environments/environment';

const {Wit, log} = require('node-wit');
const client = new Wit({accessToken: environment.wit});

const request = require('request');


admin.initializeApp(functions.config().firebase);

// initialize RecastAi Bot Buddy
const buddy = new recastai.Client(environment.recast, 'en');


async function sendPushNotification(uid: string, message: string) {
  const tokenSnapshot = await admin.database().ref(`/users/${uid}/pushToken`).once('value');
  console.log(`tokenSnapshot: ${tokenSnapshot.val()}`);


  // get push token Notification details.
  if (tokenSnapshot !== null && tokenSnapshot !== undefined) {
    const token = tokenSnapshot.val();
    console.log(`Push token: ${token}`);

    const badgeRef = admin.database().ref(`/user/${uid}/config/phases/social/unreadMessages`);
    let badge = await badgeRef.once('value');

    badge = parseInt(badge.val(), 0) || 0;
    console.log(badge);
    badge = badge + 1;
    badgeRef.set(badge);
    console.log('badge: ' + badge);

    const payload = {
      notification: {
        title: 'Buddy has a new message...',
        body: message,
        icon: 'ic_stat_recess',
        badge: badge.toString(),

      }
    };

    return admin.messaging().sendToDevice(token, payload);
  }
}

async function buddyReplies(uid: string, message: string) {
  console.log('Bot "Buddy" will reply');

  // call RecastAi and respond to user
  await buddy.textConverse(message).then(res => {
    console.log('Response from Buddy:');
    console.log(res);
    const reply = res.reply();

    if (reply !== null && reply !== undefined) {

      admin.database().ref(`/user/${uid}/conversation/`).push({
        text: reply,
        author: 'buddy',
        type: 'bot',
        alias: 'Buddy',
        timestamp: moment().valueOf()
      });

    }

  });

}

async function witReplies(uid: string, message: string) {
  console.log('Bot "Witty" will reply');

  await client.converse(`${uid}`, message, {}).then((res) => {
    console.log('Response from Witty:');
    console.log(JSON.stringify(res));

    const reply = res;

    if (reply !== null && reply !== undefined) {

      admin.database().ref(`/user/${uid}/conversation/`).push({
        text: reply.msg,
        author: 'witty',
        type: 'bot',
        alias: 'Witty',
        timestamp: moment().valueOf()
      });

    }


  }).catch(console.error);

}

async function cleverReplies(uid: string, message: string) {
  console.log('Bot "Smarty" will reply');
  const conversationRef = await admin.database().ref(`/user/${uid}/data/conversation/smarty`);

  const apiKey = environment.cleverbot;

  let cleverbotApi = `http://www.cleverbot.com/getreply?key=${apiKey}`;
  cleverbotApi += `&input=${message}`;

  const conversationData = await conversationRef.once('value');
  const conversation = conversationData.val();
  if (conversation && conversation.cs) {
    cleverbotApi += `&cs=${conversationData.val().cs}`;

  }

  console.log(`Calling ${cleverbotApi}`);

  request(cleverbotApi, (error, response, body) => {

    body = JSON.parse(body);
    console.log(body);
    console.log(body.output);


    admin.database().ref(`/user/${uid}/conversation/`).push({
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
}

export let reply = functions.database.ref(`/user/{uid}/conversation/{cuid}`).onWrite(async event => {
  console.log(event);

  if (event.params.cuid === 'placeholder') {
    return 'placeholder, do nothing.';
  }

  const message = event.data.val();

  // message is not from user, handle push notification
  if (message.author !== event.params.uid) {
    console.log(`Message [${message.text}] from ${message.author} to be send to user`);
    return sendPushNotification(event.params.uid, message.text);

  } else {
    const talkToBot = await admin.database().ref(`/user/${event.params.uid}/config/phases/social/settings/talkToBot`).once('value');
    const bid = talkToBot.val();
    console.log(`Message [${message.text}] from ${message.author} to be processed by bot [${bid}]`);

    if ('buddy' === bid) {
      const botRef = admin.database().ref(`/bots/${bid}/`);
      const bot = await botRef.once('value');
      if (!bot.val()) {
        console.log(`first initialize bot ${bid}`);

        botRef.set({
          type: 'bot',
          subtype: 'recast.ai',
          alias: 'Recast',
          timestamp: moment().valueOf(),
          users: {empty: true},
        }).then(() => {
          console.log(`Bot ${bid} initialized.`);
        });
      }

      return buddyReplies(event.params.uid, message.text);

    } else if ('witty' === bid) {
      const botRef = admin.database().ref(`/bots/${bid}/`);
      const bot = await botRef.once('value');
      if (!bot.val()) {
        console.log(`first initialize bot ${bid}`);

        botRef.set({
          type: 'bot',
          subtype: 'wit.ai',
          alias: 'Witty',
          timestamp: moment().valueOf(),
          users: {empty: true},
        }).then(() => {
          console.log(`Bot ${bid} initialized.`);
        });
      }

      return witReplies(event.params.uid, message.text);

    } else if ('smarty' === bid) {
      const botRef = admin.database().ref(`/bots/${bid}/`);

      const bot = await botRef.once('value');
      if (!bot.val()) {
        console.log(`first initialize bot ${bid}`);
        botRef.set({
          type: 'bot',
          subtype: 'hybrid',
          alias: 'Smarty',
          timestamp: moment().valueOf(),
          users: {empty: true},
        }).then(() => {
          console.log(`Bot ${bid} initialized.`);
        });
      }

      return cleverReplies(event.params.uid, message.text);

    }

  }

});