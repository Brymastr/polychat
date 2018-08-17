const BaseView = require('./BaseView');
const inquirer = require('inquirer');


class PlatformsView extends BaseView {
  constructor(eventEmitter) {
    super();
    this.eventEmitter = eventEmitter;
    this.platforms = [
      'Telegram',
      'WhatsApp',
      'Messenger',
      'Slack',
    ];
  }

  async selectPlatform(existingClients) {
    const answers = await inquirer.prompt([{
      type: 'list',
      message: 'Platforms',
      name: 'platforms',
      pageSize: this.platforms.length * 2,
      choices: this.platforms.filter(x => !existingClients.includes(x.toLowerCase())).map(x => {
        return {
          name: `${x}\n`,
          value: x.toLowerCase()
        };
      })
    }]);

    this.eventEmitter.emit('PlatformSelected', answers.platforms);
  }
}

module.exports = PlatformsView;