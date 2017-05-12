import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import * as recastai from 'recastai';

import {environment} from './environments/environment';
import * as gaussian from 'gaussian';
import DataSnapshot = admin.database.DataSnapshot;

const {Wit, log} = require('node-wit');
const client = new Wit({accessToken: environment.wit});

const request = require('request');


admin.initializeApp(functions.config().firebase);

// initialize RecastAi Bot Buddy
const buddy = new recastai.Client(environment.recast, 'en');


async function sendPushNotification(uid: string, message: string) {
  const tokenSnapshot = await admin.database().ref(`/users/${uid}/pushToken`).once('value');
  //console.log(`tokenSnapshot: ${tokenSnapshot.val()}`);


  // get push token Notification details.
  if (tokenSnapshot !== null && tokenSnapshot !== undefined) {
    const token = tokenSnapshot.val();
    //console.log(`Push token: ${token}`);

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

function queueMessage(uid: string, delay: number, message: any) {

  const queueRef = admin.database().ref(`/message_queue`);
  queueRef.push({
    message: message,
    uid: uid,
    timestamp: moment().add(delay, 'seconds').valueOf(),
    last_checked: 0
  });

}


async function sendMessage(uid: string, message: any) {
  console.log('sending message');
  console.log('after timeout', moment().valueOf());

  await admin.database().ref(`/user/${uid}/conversation/`).push(message);
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
        timestamp: moment().valueOf(),
        description: 'Using Wit.ai with personality',

      });

    }

  });

}

/*
 — Each time going to send a message, delay by time X, where normally distributed:
 — X has mean time = 10 min
 — s.d. = 5 min
 — Can tweak these numbers/distribution based on feedback


 — Each morning at 9 am, send motivational message
 — If haven’t received a message yet that day
 — 50% chance to send
 — Apply delay as above w/ 2x mean and s.d.?


 — Each afternoon at 2pm, send message to check on goals
 — If haven’t received a message since noon
 — 50% chance to send
 — randomize between step goals and healthy eating?
 — Apply delay as above w/ 2x mean and s.d.?


 — Each afternoon at 7pm, send message to check on goals
 — If haven’t received a message since 5pm
 — 50% chance to send
 — randomize between step goals and healthy eating?
 — Apply delay as above w/ 2x mean and s.d.?
 */

async function witReplies(uid: string, message: string) {
  console.log(`Bot "Witty" will reply to message [${message}]`);

  const config = {
    version: 1,
    messages: {
      responsetime: {
        mean: 7 * 60, // 7 minutes
        variance: 1 * 60, // 1 minute
        standard_deviation: 3 * 60, // 3 minutes
      }
    }

  };

  const wittyConfigRef = admin.database().ref(`/bots/witty/config`);
  let wittyConfig = await wittyConfigRef.once('value');

  // check if config has to be overwritten
  if (wittyConfig.version < config.version) {

    wittyConfigRef.set(config).then(() => {
      console.log(`Bot witty reconfigurated.`);
    });

    wittyConfig = await wittyConfigRef.once('value');

  }

  console.log(wittyConfig.val());

  const mean = wittyConfig.val().messages.responsetime.mean;
  const variance = wittyConfig.val().messages.responsetime.variance;
  const standard_derivation = wittyConfig.val().messages.responsetime.standard_deviation;

  const distribution = gaussian(mean, variance, standard_derivation);
  const delay = distribution.ppf(Math.random());

  //console.log(`Responding in: ${parseInt(sample, 1)}`);

  await client.converse(`${uid}`, message, {}).then((res) => {
    console.log('Response from Witty:');
    console.log(JSON.stringify(res));

    const reply = res;

    if (reply !== null && reply !== undefined) {
      console.log('before timeout', moment().valueOf());

      queueMessage(uid, delay, {
        text: reply.msg,
        author: 'witty',
        type: 'bot',
        alias: 'Witty',
        timestamp: moment().valueOf(),
      });

      // set timestamp
      admin.database().ref(`/user/${uid}/lastMessage`).set(moment().valueOf());

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
  //console.log(event);

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
          description: 'Using Wit.ai with personality',
          config: {
            messages: {
              responsetime: {
                mean: 7000,
                variance: 1000,
                standard_deviation: 3000,
              }
            }
          }
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

/*
 export let hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
 console.log('This job is ran every hour!');
 });
 */

export let morning_queue = functions.pubsub.topic('minute-tick').onPublish(async (event) => {
  const noMessageYetRef = admin.database().ref(`/users`).orderByChild('lastMessage').endAt(moment().startOf('day').valueOf());
  const noMessagesYet = noMessageYetRef.once('value');
  console.log(noMessagesYet);

});

export let message_queue = functions.pubsub.topic('minute-tick').onPublish(async (event) => {
  const queueRef = admin.database().ref(`/message_queue`);
  queueRef.orderByChild('timestamp');
  queueRef.endAt(moment().valueOf());

  queueRef.once('value', async function (snapshot: DataSnapshot) {
    /*
     snapshot.val().forEach((childSnapshot) => {
     // key will be "ada" the first time and "alan" the second time
     const key = childSnapshot.key;

     // childData will be the actual contents of the child
     const value = childSnapshot.val();
     console.log(`key ${key} value ${value}`);
     });
     */

    const messages = snapshot.val();
    //console.log(messages);


    for (const key in messages) {
      if (messages.hasOwnProperty(key)) {
        const message = messages[key];

        if (moment(message.timestamp).isBefore(moment())) {
          console.log(`Sending message[${message.message}] to ${message.uid}`);
          await sendMessage(message.uid, message.message);

          const messageRef = admin.database().ref(`/message_queue/${key}`);
          messageRef.remove();
        }

      }
    }


  });


});
