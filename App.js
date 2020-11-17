const PlatformsView = require('./PlatformsView');
const TelegramClient = require('./TelegramClient');
const { EventEmitter } = require('events');
const chalk = require('chalk');


class App {
  constructor() {
    this.terminal = require('terminal-kit').terminal;
    this.terminal.grabInput(true);
    this.terminal.fullscreen();
    this.terminal.windowTitle('Polychat');

    this.eventEmitter = new EventEmitter();
    this.platformsView = new PlatformsView(this.terminal, this.eventEmitter);
    this.checkMessagesInterval;
    this.activeView;
    this.clients = [];
    this.selectedClient;
    this.selectedChat;

    this.terminate = function() {
      this.terminal.clear();
      this.terminal.grabInput(false);
      this.terminal.processExit(0);
    }

    this.terminal.on('key', name => {
      if(name === 'CTRL_C') this.terminate();
      else if(name === 'ESCAPE') {
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
      this.terminal.clear();
      this.terminal.windowTitle(platform)

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
      this.terminal.clear();

      this.activeView = 'single chat';
      
      const client = this.clients.find(x => x.id === result.client_id);
      const chat = client.chats.find(x => x.id === result.chat_id);
      this.selectedChat = chat;

      await client.refreshMessages(chat, true);
      await client.showMessages(chat);
      let numberOfMessages = chat.messages.length;

      this.checkMessagesInterval = setInterval(async () => {
        numberOfMessages = chat.messages.length;
        await client.refreshMessages(chat);

        if(chat.messages.length > numberOfMessages) {
          const newMessages = chat.messages.slice(numberOfMessages);
          await client.showMessages(chat, newMessages);
        }
      }, 5000);
      
    });

    this.eventEmitter.on('EscapePressedInSingleChat', async () => {
      clearInterval(this.checkMessagesInterval);
      this.terminal.grabInput(false);
      this.activeView = 'all chats';
      this.terminal.clear();
      this.selectedClient.selectChat();
    });

    this.eventEmitter.on('EscapePressedInAllChats', async () => {
      this.terminal.clear();
      this.terminal.windowTitle('Polychat');
      this.selectPlatform();
    });

    this.eventEmitter.on('EscapePressedInPlatforms', async () => {
      this.terminal.clear();
      this.terminate();
    });

    this.eventEmitter.on('MessageSubmitted', async text => {
      const to = this.selectedChat.to;
      const result = await this.selectedClient.sendMessage(text, to.id, to.access_hash, to.type);
      const messageResult = result.updates[1].message;

      const message = {
        user_id: messageResult.from_id,
        date: new Date(messageResult.date * 1000),
        message: messageResult.message,
        id: messageResult.id,
      };

      this.selectedChat.appendMessages([ message ]);
      this.selectedClient.showMessages(this.selectedChat, [ message ]);
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
        client = new TelegramClient(this.eventEmitter, this.terminal);
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

}

module.exports = App;