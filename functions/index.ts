import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as moment from 'moment-timezone';
import * as recastai from 'recastai';

import {environment} from './environments/environment';
import * as gaussian from 'gaussian';
moment.tz.setDefault('America/Toronto');

import DataSnapshot = admin.database.DataSnapshot;

const {Wit, log} = require('node-wit');
const client = new Wit({accessToken: environment.wit});

const request = require('request');


admin.initializeApp(functions.config().firebase);

console.log(`New deployment`, moment().format('DD.MM.YY HH:mm'));


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// initialize RecastAi Bot Buddy
const buddy = new recastai.Client(environment.recast, 'en');


async function sendPushNotification(uid: string, message: string) {
  const tokenSnapshot = await admin.database().ref(`/users/${uid}/pushToken`).once('value');


  // get push token Notification details.
  if (tokenSnapshot !== null && tokenSnapshot !== undefined) {
    const token = tokenSnapshot.val();

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

  // set lastmessage
  admin.database().ref(`/users/${uid}/lastMessage`).set(moment().valueOf());
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
 [x] Each time going to send a message, delay by time X, where normally distributed:
 — X has mean time = 10 min
 — s.d. = 5 min
 — Can tweak these numbers/distribution based on feedback


 [x] Each morning at 9 am, send motivational message
 — If haven’t received a message yet that day
 — 50% chance to send -> should be send every day
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
  let wittyConfig = (await wittyConfigRef.once('value')).val();

  // check if config has to be overwritten
  if (wittyConfig.version < config.version) {

    wittyConfigRef.set(config).then(() => {
      console.log(`Bot witty reconfigurated.`);
    });

    wittyConfig = (await wittyConfigRef.once('value')).val();

  }

  console.log(wittyConfig);

  const mean = wittyConfig.messages.responsetime.mean;
  const variance = wittyConfig.messages.responsetime.variance;
  const standard_derivation = wittyConfig.messages.responsetime.standard_deviation;
  const distribution = gaussian(mean, variance, standard_derivation);

  const delay = distribution.ppf(Math.random());

  // filter messages if custom reply necessary
  // if intent == progress: "You can view my progress by pulling down the activity screen"
  // if intent == steps: "You can view my steps by pulling down the activity screen"
  // if intent == hours_active: "You can view my active hours by pulling down the activity screen"
  // if intent == goal: "You can view my goal by pulling down the activity screen"

  await client.converse(`${uid}`, message, {}).then(async (res) => {
    console.log('Response from Witty:');
    console.log(JSON.stringify(res));

    const reply = res;

    if (reply !== null && reply !== undefined) {

      // Steps
      if ('You can view my steps by pulling down the activity screen' === reply.msg) {
        let steps = (await admin.database().ref(`/user/${uid}/data/ui/buddy/steps/${moment().format('YYYY-MM-DD')}`).once('value')).val();
        if (steps !== undefined && steps < 1) {
          steps = 100;
        }
        const replyMsg = `I already walked about ${steps} steps`;

        queueMessage(uid, delay, {
          text: replyMsg,
          author: 'witty',
          type: 'bot',
          alias: 'Witty',
          timestamp: moment().valueOf(),
        });

      } else if ('You can view my active hours by pulling down the activity screen' === reply.msg) {
        const active =
          (await admin.database().ref(`/user/${uid}/data/ui/buddy/activity/${moment().format('YYYY-MM-DD')}`)
            .once('value')).val();

        let activity = 1;
        if (active !== undefined && active.totalHours > 1) {
          activity = active.totalHours;
        }
        const replyMsg = `I've been active for about ${activity} hours`;

        queueMessage(uid, delay, {
          text: replyMsg,
          author: 'witty',
          type: 'bot',
          alias: 'Witty',
          timestamp: moment().valueOf(),
        });

      } else if ('You can view my goal by pulling down the activity screen' === reply.msg) {
        const goals =
          (await admin.database().ref(`/user/${uid}/config/phases/goals/settings`)
            .once('value')).val();


        const replyMsg = `I'm trying to be active for ${goals.activity} hours a day and doing ${goals.steps} steps`;

        queueMessage(uid, delay, {
          text: replyMsg,
          author: 'witty',
          type: 'bot',
          alias: 'Witty',
          timestamp: moment().valueOf(),
        });

      } else {
        queueMessage(uid, delay, {
          text: reply.msg,
          author: 'witty',
          type: 'bot',
          alias: 'Witty',
          timestamp: moment().valueOf(),
        });

      }


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
    // console.log(body);
    // console.log(body.output);


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

export let remove = functions.database.ref(`/users/{uid}/deleted`).onWrite(async event => {
  const deleted = event.data.val();
  console.log(deleted);

  if (deleted) {
    console.log(`User ${event.params.uid} marked as deleted.`);

    admin.auth().deleteUser(event.params.uid).then(function () {
      console.log(`User ${event.params.uid} deleted.`);

    }).catch(function (error) {
      console.log(`Error deleting user ${event.params.uid}`, error);

    });

  } else {
    console.log(`User ${event.params.uid} marked as not deleted.`);
  }

});

export let reply = functions.database.ref(`/user/{uid}/conversation/{cuid}`).onWrite(async event => {

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
          description: 'Using Wit.ai with personality.',
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

export let afternoon_queue = functions.pubsub.topic('afternoon-tick').onPublish(async (event) => {
  // console.log('afternoon tick');
  // const afternoonMessages = (await admin.database().ref(`/messages`).orderByChild('category').equalTo('afternoon').once('value')).val();
  // console.log(afternoonMessages);
  await engage('afternoon');

});

export let evening_queue = functions.pubsub.topic('evening-tick').onPublish(async (event) => {
  // console.log('evening tick');
  // const eveningMessages = (await admin.database().ref(`/messages`).orderByChild('category').equalTo('evening').once('value')).val();
  // console.log(eveningMessages);
  await engage('evening');

});


export let morning_queue = functions.pubsub.topic('morning-tick').onPublish(async (event) => {

  await engage('morning');

});


async function engage(category: string) {
  let morningMessages = await admin.database().ref(`/messages`).orderByChild('category').equalTo(category).once('value');
  morningMessages = morningMessages.val();

  const noMessageYetRef = admin.database().ref(`/users`).orderByChild('lastMessage').endAt(moment().startOf('day').valueOf());
  let noMessagesYet = await noMessageYetRef.once('value');
  noMessagesYet = noMessagesYet.val();

  console.log(`List of users(${Object.keys(noMessagesYet).length}) with no messages:`);
  console.log(Object.keys(noMessagesYet));

  if (null === noMessagesYet) {
    console.log('cancel this morning hi');
    return;
  }

  const messageKeys = Object.keys(morningMessages);

  if (noMessagesYet) {
    Object.keys(noMessagesYet).forEach(key => {
      console.log(`Sending a morning message to [${key}]`);
      const value = noMessagesYet[key];

      const chanceToSend = getRandomInt(0, 100);
      if (chanceToSend >= 0) {

        if (value && value.uid) {
          const randomNumber = getRandomInt(0, messageKeys.length - 1);
          const randomKey = messageKeys[randomNumber];

          /*
           console.log('-----');
           console.log(messageKeys);
           console.log(randomNumber);
           console.log(morningMessages);
           console.log(randomKey);
           console.log('+++++');
           */

          const morningMessage = {
            text: morningMessages[randomKey].message,
            author: category,
            type: 'function',
            alias: category.charAt(0).toUpperCase() + category.slice(1), // first letter uppercase
            timestamp: moment().valueOf(),
          };

          console.log(morningMessage);

          queueMessage(value.uid, 0, morningMessage);

        }

      }

      // mark user as last message send
      admin.database().ref(`/users/${value.uid}/lastMessage`).set(moment().valueOf());

    });

    console.log(Object.keys(noMessagesYet).length);
  }
}

export let message_queue = functions.pubsub.topic('minute-tick').onPublish(async (event) => {
  const now = moment();
  const queueRef = admin.database().ref(`/message_queue`);
  queueRef.orderByChild('timestamp');
  queueRef.endAt(now.valueOf());

  console.log(`Looking for messages older than ${now.format('DD.MM.YYYY HH:mm')}`);

  queueRef.once('value', async function (snapshot: DataSnapshot) {

    const messages = snapshot.val();

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
