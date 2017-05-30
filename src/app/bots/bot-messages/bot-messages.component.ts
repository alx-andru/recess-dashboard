import {Component, OnInit} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';

@Component({
  selector: 'app-bot-messages',
  templateUrl: './bot-messages.component.html',
  styleUrls: ['./bot-messages.component.scss']
})
export class BotMessagesComponent implements OnInit {
  messages: FirebaseListObservable<any>;
  types: any[];
  categories: any[];
  msg: any;

  constructor(public db: AngularFireDatabase) {
    this.messages = db.list(`/messages`);


    this.types = [
      {
        value: 'engagement',
        display: 'Engagement'
      }
    ];

    this.categories = [
      {
        value: 'morning',
        display: 'Morning'
      },
      {
        value: 'noon',
        display: 'Noon'
      },
      {
        value: 'afternoon',
        display: 'Afternoon'
      },
      {
        value: 'evening',
        display: 'Evening'
      }
    ];

    this.msg = {
      type: 'engagement',
      category: 'morning',
      message: ''
    };


  }

  ngOnInit() {

  }

  addMessage() {
    this.messages.push(this.msg);
    this.msg = {
      type: 'engaement',
      cateogry: 'morning',
      message: ''
    };
  }

  updateMessage(message) {
    console.log(message);
    if (message.message.length === 0) {
      this.messages.remove(message.$key);
    } else {
      this.messages.update(message.$key, {
        message: message.message,
        type: message.type,
        category: message.category,
      });
    }


  }

  deleteMessage(key: string) {
    this.messages.remove(key);
  }

}
