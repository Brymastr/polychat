const readline = require('readline');
const chalk = require('chalk');
const BaseView = require('./BaseView');
const boxes = require('./boxes.json');


class ChatView extends BaseView {

  constructor(user, terminal, eventEmitter) {
    super(terminal, eventEmitter);
    this.user = user;
    this.terminal.clear();
  }

  start(title) {
    // this.rl = readline.createInterface({
    //   input: process.stdin,
    //   output: process.stdout,
    // });

    this.write(title + '\n\n');
  }

  draw(users, messages) {
    const content = this.draftContent(users, messages);
    this.terminal.up(2);
    this.terminal('\n');
    this.terminal.eraseDisplayBelow();
    this.terminal(content.join('\n\n\n'));
    this.terminal('\n\n\n');
  }

  draftContent(users, messages) {
    /**
     * Mark Niehe    August 17th, 2018
     * @Brycen is going to bring them past your office in a bit, @TheDiesel
     */
    return messages.map(x => {
      const user = users.find(y => y.id === x.user_id);

      return `${this.color(user.name, 'bold')}    ${this.color(x.date.toLocaleString(), 'italic', 'dim')}\n${x.message}`;
    });
  }
  
  drawInput() {
    this.terminal(boxes['double-single'].horizontal.repeat(this.terminal.width));
    this.terminal('\n>');
    this.terminal.grabInput(true);
    this.terminal.inputField({}, (err, result) => {
      this.terminal.eraseLine();
      this.eventEmitter.emit('MessageSubmitted', result);
      this.terminal.grabInput(false);
    });
  }

  // start() {
  //   this.terminal.clear();

  //   const { rows, columns } = this.dimensions;

  //   for(let i = 0; i < rows - 1; i++) {
  //     this.write('\n');
  //   }

  //   readline.cursorTo(process.stdout, 0, 0);

  //   this.redraw();
  // }

  redraw(messages, oldRows, oldColumns) {
    this.terminal.clear();
    const { rows, columns } = this.dimensions;

    readline.cursorTo(process.stdout, 0);
    readline.moveCursor(process.stdout, 0, oldRows * -1);

    // Top padding
    for(let i = 0; i < this.padding - 1; i++) {
      this.write('\n');
    }

    // Top of rectangle
    this.write(' '.repeat(this.padding * 2) + '╔' + '═'.repeat(columns - (this.padding * 4) - 2) + '╗', 'magenta');

    // sides of rectangle
    for(let i = 0; i < rows - (this.padding * 2); i++) {
      this.write('\n');
      this.write(' '.repeat(this.padding * 2) + '║'.padEnd(columns - (this.padding * 4) - 1) + '║', 'magenta');
    }

    // bottom of rectangle
    this.write('\n');
    this.write(' '.repeat(this.padding * 2) + '╚' + '═'.repeat(columns - (this.padding * 4) - 2) + '╝', 'magenta');
    
  }

  write(text) {
    process.stdout.write(text);
  }

  color(text, ...rest) {
    if(rest.length === 0)
      return chalk['whiteBright'](text);
    else if(rest.length === 1)
      return chalk[rest[0]](text);
    else if(rest.length === 2)
      return chalk[rest[0]][rest[1]](text);
    else if(rest.length === 3)
      return chalk[rest[0]][rest[1]][rest[2]](text);
  }
}

module.exports = ChatView;