const readline = require('readline');
const chalk = require('chalk');
const termSize = require('term-size');
const getCursorPosition = require('get-cursor-position');
const inquirer = require('inquirer');
const BaseView = require('./BaseView');


class ChatsView extends BaseView {

  constructor(client_id, eventEmitter, chat) {
    super();
    this.eventEmitter = eventEmitter;
    this.client_id = client_id;

    this.chat = chat;
  }

  async selectChat(chats) {
    const choices = chats.map(x => {
      let message = x.messages[0].message.replace(/\n/g, '');
      if(message.length > 100) message = message.substr(0, 100) + '...';
      return {
        name: `${x.title}\n    ${message}\n`,
        value: x.id,
      };
    });

    const answers = await inquirer.prompt([{
      type: 'list',
      message: 'Telegram',
      name: 'chats',
      pageSize: choices.length * 3,
      choices,
    }]);

    this.eventEmitter.emit('ChatSelected', {
      client_id: this.client_id,
      chat_id: answers.chats,
    });
  }
}

module.exports = ChatsView;