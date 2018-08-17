const readline = require('readline');
const PlatformsView = require('./PlatformsView');
const TelegramClient = require('./TelegramClient');
const { EventEmitter } = require('events');
const chalk = require('chalk');

class App {
  constructor() {
    this.eventEmitter = new EventEmitter();

    this.checkMessagesInterval;

    this.eventEmitter.on('PlatformSelected', async platform => {
      this.clear();

      const client = this.createClient(platform);
      if(!client.isAuthenticated()) {
        await client.authenticate();
      }

      this.clients.push(client);

      client.selectChat();
    });

    this.eventEmitter.on('ChatSelected', async result => {
      this.clear();
      
      const client = this.clients.find(x => x.id === result.client_id);
      const chat = client.chats.find(x => x.id === result.chat_id);

      await client.refreshMessages(chat)
      await client.showMessages(chat);
      let numberOfMessages = chat.messages.length;

      this.checkMessagesInterval = setInterval(async () => {
        numberOfMessages = chat.messages.length;
        await client.refreshMessages(chat);

        if(chat.messages.length > numberOfMessages)
          await client.showMessages(chat);
      }, 1000);


      
    });

    this.clients = [];

    this.selectPlatform();
  }

  async selectPlatform() {
    const view = new PlatformsView(this.eventEmitter);

    await view.selectPlatform(this.clients.map(x => x.type));
  }

  createClient(platform) {
    let client;

    switch(platform) {
      case 'telegram':
        client = new TelegramClient(this.eventEmitter);
        break;
      case 'slack':
        console.log('new slack client')
        break;
      case 'whatsapp':
        console.log('new whatsapp client')
        break;
      case 'messenger':
        console.log('new messenger client')
        break;
      default:
        console.log('unimplemented');
    }

    return client;
  }

  write (text, color = 'whiteBright') {
    process.stdout.write(chalk[color](text));
  }

  clear() {
    this.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
  }
}

module.exports = App;