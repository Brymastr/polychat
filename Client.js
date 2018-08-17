const uuid = require('uuid/v4');
const ChatsView = require('./ChatsView');


class Client {
  constructor(eventEmitter, type) {
    this.type = type;
    this.id = uuid();
    this.eventEmitter = eventEmitter;
    this.user;
    this.chatsView = new ChatsView(this.id, this.eventEmitter);
    this.chats;
  }
}

module.exports = Client;