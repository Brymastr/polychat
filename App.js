const readline = require('readline');
const PlatformsView = require('./PlatformsView');
const TelegramClient = require('./TelegramClient');
const { EventEmitter } = require('events');
const chalk = require('chalk');

class App {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.platformsView = new PlatformsView(this.eventEmitter);
    this.checkMessagesInterval;
    this.activeView;
    this.clients = [];
    this.selectedClient;
    this.selectedChat;

    process.stdin.on('keypress', (ch, key) => {
      if(key.name === 'escape') {
        if(this.activeView === 'all chats') {
          this.eventEmitter.emit('EscapePressedInAllChats');
        } else if(this.activeView === 'platforms') {          
          this.eventEmitter.emit('EscapePressedInPlatforms');
        } else if(this.activeView === 'single chat') {
          this.eventEmitter.emit('EscapePressedInSingleChat');
        }
      }
    });

    this.eventEmitter.on('PlatformSelected', async platform => {
      this.clear();

      const client = this.createClient(platform);
      if(!client.isAuthenticated()) {
        await client.authenticate();
      }

      this.clients.push(client);
      this.selectedClient = client;

      this.activeView = 'all chats';

      client.selectChat();
    });

    this.eventEmitter.on('ChatSelected', async result => {
      this.clear();

      this.activeView = 'single chat';
      
      const client = this.clients.find(x => x.id === result.client_id);
      const chat = client.chats.find(x => x.id === result.chat_id);
      this.selectedChat = chat;

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

    this.eventEmitter.on('EscapePressedInSingleChat', async () => {
      clearInterval(this.checkMessagesInterval);
      this.selectedChat.chatView.rl.close();
      this.activeView = 'all chats';
      this.clear();
      this.selectedClient.selectChat();
    });

    this.eventEmitter.on('EscapePressedInAllChats', async () => {
      this.clear();
      this.selectPlatform();
    });

    this.eventEmitter.on('EscapePressedInPlatforms', async () => {
      this.clear();
      process.exit(0);
    });

    this.selectPlatform();
  }

  async selectPlatform() {
    this.activeView = 'platforms';

    await this.platformsView.selectPlatform(this.clients.map(x => x.type));
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