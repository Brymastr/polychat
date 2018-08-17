const readline = require('readline');
const chalk = require('chalk');
const termSize = require('term-size');
const getCursorPosition = require('get-cursor-position');
const tty = require('tty');


class ChatView {

  constructor(user, options) {

    // console.log('ChatView constructor');

    // this.padding = options.padding;
    // this.user = user;
    // this.users;
    // this.title;
    // this.messages;

    // this.rl = readline.createInterface({
    //   input: process.stdin,
    //   output: process.stdout
    // });

    // this.dimensions = termSize();

    // readline.emitKeypressEvents(process.stdin);

    // if(process.stdin.isTTY) process.stdin.setRawMode(true);

    // process.stdout.on('resize', () => {
    //   const oldRows = this.dimensions.rows;
    //   const oldColumns = this.dimensions.columns;
    //   this.dimensions = Object.assign({}, termSize());

    //   this.redraw(oldRows, oldColumns);
    // });

    // process.stdin.on('keypress', (ch, key) => {
    //   const currentColumn = (getCursorPosition.sync()).col - 1;
    //   const currentRow = (getCursorPosition.sync()).row - 1;
    //   const columnLength = [...currentColumn.toString()].length;

    //   switch(key.name) {
        
    //     case 'up':
    //       readline.moveCursor(process.stdout, 0, -1);
    //       break;
    //     case 'down':
    //       readline.moveCursor(process.stdout, 0, 1);
    //       break;
    //     case 'left':
    //       readline.moveCursor(process.stdout, -1, 0);
    //       break;
    //     case 'right':
    //       readline.moveCursor(process.stdout, 1, 0);
    //       break;
    //   }

    // });

    // process.on('exit', this.clear.bind(this));

    // this.start();
  }

  draw(title, users, messages) {
    const content = this.draftContent(users, messages);
    this.clear();
    this.write(title + '\n\n');

    this.write(content.join('\n\n'));
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

  clear() {
    this.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
  }

  start() {
    this.clear();

    const { rows, columns } = this.dimensions;

    for(let i = 0; i < rows - 1; i++) {
      this.write('\n');
    }

    readline.cursorTo(process.stdout, 0, 0);

    this.redraw();
  }

  redraw(messages, oldRows, oldColumns) {
    this.clear();
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