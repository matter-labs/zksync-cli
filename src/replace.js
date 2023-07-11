const readline = require("readline");
const fs = require("fs");
const { EOL } = require("os");

let filename;

if (process.argv.length === 3) {
  filename = process.argv[2];
  console.log("Filename:", filename);

  if (!fs.existsSync(filename)) {
    console.log("Error: file does not exists");
    process.exit(1);
  }

  // Create copy of file to use for attempted string replacement - Keep file permissions the same
  // Fail if file already exists
  fs.copyFileSync(filename, filename + "-new", fs.constants.COPYFILE_EXCL);

  const readInterface = readline.createInterface({
    input: fs.createReadStream(filename),
    output: fs.createWriteStream(filename + "-new"),
    terminal: false,
  });

  let counter = 0;

  readInterface.on("line", function (line) {
    if (line) {
      const regex = /.*process\.env\.([a-zA-Z0-9_]*).*/;
      let envArray = line.match(regex);
      if (envArray && envArray.length) {
        let envValue = process.env[envArray[1]];
        if (envValue) {
          line = line.replace(`process.env.${envArray[1]}`, `"${envValue}"`);
          counter++;
        }
      }
      this.output.write(`${line}${EOL}`);
    } else {
      this.output.write(EOL);
    }
  });

  readInterface.on("close", function (event) {
    // Rename updated version of file to original overwriting original
    fs.renameSync(filename + "-new", filename);
    console.log(`Succesfully updated ${filename}`);
    console.log(`Replaced ${counter} variables`);
  });
} else {
  console.log("Error: must receive single argument containing filename");
  console.log("Usage: 'replace-env <filename.txt>'");
}
