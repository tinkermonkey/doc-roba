var fs = require('fs');

export const DocRoba = {
  basePath: fs.realpathSync(process.env.PWD)
};
console.log("DocRoba.basePath:", DocRoba.basePath);
