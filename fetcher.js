const request = require('request');
const readline = require('readline');
const fs = require('fs');
const args = process.argv.slice(2);

let textBody = '';

request(args[0], (error, response, body) => {
  if (response.statusCode !== 200) {
    console.log(`Blah! Not good. Your URL is a bad egg, please check it over.`);
    return;
  }
  textBody = body;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  // Check if the file exists in the current directory, and if it is writable.
  // Intial options skimmed and aquired from https://nodejs.org/api/fs.html#fs_class_fs_writestream
  // A MUCH better definition of writeStream for use found here: https://dustinpfister.github.io/2018/08/17/nodejs-filesystem-create-write-stream/
  // Deeper example in https://github.com/nodejs/node/issues/23324 led me to the callback in .write

  fs.open(args[1], 'wx', (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('You fool! You dare save to place not in my memory?');
        process.exit();
      } else if (err.code === 'EEXIST') {
        rl.question('File exists, would you like to overwrite? y/n: ', (answer) => {
          if (answer === 'y') {
            let stream = fs.createWriteStream(args[1]);
            stream.write(textBody, () => {
              console.log(`Downloaded and saved ${stream.bytesWritten} to ${args[1]}`);
            });
          }
          rl.close();
        });
      } else {
        console.log(err.code);
      }
    } else {
      let stream = fs.createWriteStream(args[1]);
      stream.write(textBody, () => {
        console.log(`Downloaded and saved ${stream.bytesWritten} bytes to ${args[1]}`);
      });
    }
  });
});