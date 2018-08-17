const readline = require('readline');
const chalk = require('chalk');
const termSize = require('term-size');
const getCursorPosition = require('get-cursor-position');


class BaseView {

  constructor(padding = 2) {

    // this.padding = padding;

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

  redraw(oldRows, oldColumns) {
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

  write (text, color = 'whiteBright') {
    process.stdout.write(chalk[color](text));
  }
}

module.exports = BaseView;