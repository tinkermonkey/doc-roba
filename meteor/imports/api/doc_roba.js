var fs = require('fs');

export const DocRoba = {
  rootPath: fs.realpathSync(process.env.PWD)
};
console.log("DocRoba.rootPath:", DocRoba.rootPath);
