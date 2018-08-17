const { MTProto } = require('telegram-mtproto');
const { Storage } = require('mtproto-storage-fs');
const Client = require('./Client');
const Chat = require('./Chat');
const ChatView = require('./ChatView');
const shortid = require('shortid');
const fs = require('fs');
const readline = require('readline');

const appConfig = require('./telegram/app.json');

const API_ID = appConfig.api_id;
const API_HASH = appConfig.api_hash;

class TelegramClient extends Client {
  constructor(eventEmitter) {
    super(eventEmitter, 'telegram');
    this.telegram = MTProto({
      server: {
        dev: false
      }, 
      api: { 
        layer: 57,
        api_id: API_ID,
        invokeWithLayer: 0xda9b0d0d,
        initConnection: 0x69796de9,
      },
      app: {
        storage: new Storage('./telegram/storage.json')
      }
    });

    this.phone_number;
    this.phone_code;
    this.phone_code_hash;

    this.sessionStorage = fs.readFileSync('./telegram/storage.json', 'utf8');

    this.selectedChat;

    this.config();
  }

  async selectChat() {
    const dialogs = await this.getDialogs();
    const chats = this.createChats(dialogs);
    chats.sort((a, b) => a.messages[0].date <= b.messages[0].date ? 1 : -1);
    this.chats = chats;

    this.chatsView.selectChat(chats);
  }

  createChats(dialogsResponse) {
    return dialogsResponse.dialogs.map(x => {
      const peerType = x.peer.user_id ? 'user' : 'chat';
      // Get the raw 'peer' object from the getDialogs response
      const dialogPeer = dialogsResponse[`${peerType}s`].find(y => y.id === x.peer[`${peerType}_id`]);
      const top_message = dialogsResponse.messages.find(y => y.id === x.top_message);

      const chat = new Chat(this.user, this.getTitle(dialogPeer), {
        type: peerType,
        id: dialogPeer.id,
        access_hash: dialogPeer.access_hash,
      });

      chat.appendMessages(dialogsResponse.messages.filter(y => y.id === x.top_message));
      
      return chat;
    });
  }

  getTitle(dialogPeer) {
    let title;

    if(dialogPeer.title) title = dialogPeer.title;
    else {
      if(dialogPeer.first_name && dialogPeer.last_name) title = `${dialogPeer.first_name} ${dialogPeer.last_name}`;
      else if(dialogPeer.first_name && !dialogPeer.last_name) title = dialogPeer.first_name;
      else title = dialogPeer.username;
    }

    return title;
  }

  async showMessages(chat) {
    // call showMessages on chat
    chat.showMessages();
  }

  async refreshMessages(chat) {
    // TODO: Don't look for the right chat each time. Instead, return the full chat object to ChatSelected event
    const { id, access_hash, type } = chat.to;
    const chatHistory = await this.getHistory(id, access_hash, type);

    chat.appendMessages(chatHistory.messages);
    chat.setUsersInChat(chatHistory.users);
  }

  isAuthenticated() {
    return this.user && this.sessionStorage;
  }

  async authenticate() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Ask for phone number
    this.phone_number = await question(rl, 'Phone Number: ');
    if(!this.phone_number) this.phone_number = '12509377361';
    rl.write(`Sending auth code...\n`);
    await this.sendCode();
    rl.write(`SMS Auth Code sent to ${this.phone_number}\n\n`);
  
    // Ask for sms code
    this.phone_code = await question(rl, 'SMS Auth Code: ');
    await this.signIn();

    rl.close();
  }

  config() {
    try {
      const userJson = require('./telegram/user.json');
      this.user = userJson;
    } catch(err) {
      this.user = null;
    }
  }

  async sendCode() {
    const { phone_code_hash } = await this.telegram('auth.sendCode', {
      phone_number  : this.phone_number,
      current_number: false,
      api_id        : API_ID,
      api_hash      : API_HASH,
      sms_type      : 5
    });
    this.phone_code_hash = phone_code_hash;
  }

  async signIn() {
    const { phone_number, phone_code_hash, phone_code } = this;
    const response = await this.telegram('auth.signIn', {
      phone_number, phone_code_hash, phone_code
    });

    this.user = response.user;
    fs.writeFileSync('./telegram/user.json', JSON.stringify(this.user));
  }

  async sendMessage(message, peer) {
    shortid.characters('0123456789');
    const response = await this.telegram('messages.sendMessage', {
      peer: {
        _: "inputPeerUser",
        user_id: '111560744',
        access_hash: '13807088105681716654',
      },
      random_id: shortid.generate(),
      message,
    });

    console.log(response);
  }

  getDialogs() {
    /**
    {
      _: 'dialog',
      flags: 0,
      peer: [Object],
      top_message: 48586,
      read_inbox_max_id: 48512,
      read_outbox_max_id: 48577,
      unread_count: 5,
      notify_settings: [Object]
    }

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

    {
      _: 'user',
      flags: 6271,
      contact: true,
      mutual_contact: true,
      id: 111560744,
      access_hash: '13807088105681716654',
      first_name: 'Mark',
      last_name: 'Niehe',
      username: 'mniehe',
      phone: '16047736475',
      photo: [Object],
      status: [Object]
    }

    {
      _: 'chat',
      flags: 0,
      id: 276927134,
      title: 'Bitcoin bubble',
      photo: [Object],
      participants_count: 3,
      date: 1510862105,
      version: 1
    }
    */
    return this.telegram('messages.getDialogs', {
      limit: 15,
    });
  }

  async getUsers() {
    const response = await this.telegram('messages.getDialogs', {
      limit: 50,
    });

    return response.users.map(x => {
      const { id, access_hash, first_name, phone, username } = x;
      return { id, access_hash, first_name, phone, username };
    });
  }

  async getState() {
    const result = await this.telegram('updates.getState', {});
    // console.log(result)
  }

  async getMessages() {
    const result = await this.telegram('updates.getMessages', {});
    // console.log(result)
  }

  async getHistory(peerId, accessHash, type) {
    const typeId = `${type}_id`;
    const peer = {
      _: `inputPeer${type.charAt(0).toUpperCase()}${type.substr(1)}`,
      access_hash: accessHash,
    };
    peer[typeId] = peerId;
    return this.telegram('messages.getHistory', {
      peer,
      limit: 10
    });
  }

}

function question(rl, question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

module.exports = TelegramClient;