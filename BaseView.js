const readline = require('readline');
const chalk = require('chalk');


class BaseView {

  constructor(terminal, eventEmitter) {
    this.terminal = terminal;
    this.eventEmitter = eventEmitter;
  }

  start() {
    this.terminal.clear();

    const { rows, columns } = this.dimensions;

    for(let i = 0; i < rows - 1; i++) {
      this.write('\n');
    }

    readline.cursorTo(process.stdout, 0, 0);

    this.redraw();
  }

  redraw(oldRows, oldColumns) {
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

  write (text, color = 'whiteBright') {
    process.stdout.write(chalk[color](text));
  }
}

module.exports = BaseView;