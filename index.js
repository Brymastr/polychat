const readline = require('readline');
const fs = require('fs');
const App = require('./App');


!async function main() {
  const app = new App();

}();

function printMessages(history) {
  const users = history.users.map(x => {
    return {
      id: x.id,
      access_hash: x.access_hash,
      first_name: x.first_name,
      last_name: x.last_name,
      username: x.username,
    };
  });
}

function wait(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}