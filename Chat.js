const uuid = require('uuid/v4');
const ChatView = require('./ChatView');


class Chat {
  constructor(loggedInUser, title, to) {
    this.id = uuid();
    this.to = to;
    this.user = loggedInUser; // So we know which messages to display on the right
    this.title = title;
    this.messages = [];
    this.messageIds = new Set();
    this.usersInChat = [];

    this.chatView = new ChatView();
  }

  appendMessages(rawMessages) {
    /**
     { 
      _: 'message',
      flags: 264,
      id: 48586,
      from_id: 170626562,
      to_id: [Object],
      reply_to_msg_id: 48585,
      date: 1534529047,
      message: 'same'
    }
    */
    for(const m of rawMessages) {

      const exists = this.messageIds.has(m.id);
      if(exists) continue;
      
      this.messageIds.add(m.id);

      this.messages.push({
        user_id: m.from_id,
        date: new Date(m.date * 1000),
        message: m.message.replace(/\n/g, ' '),
      });
    }

    this.messages.sort((a, b) => a.date >= b.date ? 1 : -1);
  }

  setUsersInChat(rawUsers) {
    for(const u of rawUsers) {
      let name;
      if(u.first_name && !u.last_name) name = u.first_name;
      else if(u.first_name && u.last_name) name = `${u.first_name} ${u.last_name}`;
      else name = u.username;
      this.usersInChat.push({
        id: u.id,
        name
      });
    }
  }

  showMessages() {
    this.chatView.draw(this.title, this.usersInChat, this.messages);
  }
}

module.exports = Chat;