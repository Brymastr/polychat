const BaseView = require('./BaseView');
const inquirer = require('inquirer');


class PlatformsView extends BaseView {
  constructor(terminal, eventEmitter) {
    super(terminal, eventEmitter);
    this.platforms = [
      'Telegram',
      'WhatsApp',
      'Messenger',
      'Slack',
    ];
    // this.platforms.map(x => `\n${x}\n`);
  }

  async selectPlatform(existingClients) {
    // const answers = await inquirer.prompt([{
    //   type: 'list',
    //   message: 'Platforms',
    //   name: 'platforms',
    //   pageSize: this.platforms.length * 2,
    //   choices: this.platforms.map(x => {
    //     return {
    //       name: `${x}\n`,
    //       value: x.toLowerCase(),
    //     };
    //   })
    // }]);

    this.terminal.singleColumnMenu(this.platforms, (err, response) => {
      this.eventEmitter.emit('PlatformSelected', response.selectedText.toLowerCase());
    });

  }
}

module.exports = PlatformsView;