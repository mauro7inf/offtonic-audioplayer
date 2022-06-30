const path = require('path');
const fs = require('fs');

const processorRegex = /^(import \S+ from '(\S+)';)?([\s\S]*)(export default .*)$/;

let processorFiles = [];

function getProcessorFilesFromDir(dir) {
  let files = fs.readdirSync(dir);
  files.forEach(file => {
    let filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getProcessorFilesFromDir(filePath);
    } else {
      processorFiles.push({dir: dir, filename: file});
    }
  });
}

let processorsDir = path.join(__dirname, '..', 'lib', 'processors');
getProcessorFilesFromDir(processorsDir);

let processorFilesInfo = {}

processorFiles.forEach(file => {
  let filePath = path.join(file.dir, file.filename);
  let contents = fs.readFileSync(filePath, 'utf8');
  let matches = contents.match(processorRegex);
  if (matches === null) {
    console.error('Error in file ' + filePath + ': Invalid format');
  } else {
    processorFilesInfo[filePath] = {
      content: matches[3]
    };
    if (matches[2] !== undefined) {
      processorFilesInfo[filePath].superFile = path.join(file.dir, matches[2]);
    }
  }
});

let unprocessedFiles = Object.keys(processorFilesInfo);
let orderedFiles = [];

while (unprocessedFiles.length > 0) {
  for (let i = 0; i < unprocessedFiles.length; i++) {
    let file = unprocessedFiles[i];
    if (!('superFile' in processorFilesInfo[file]) || orderedFiles.includes(processorFilesInfo[file].superFile)) {
      orderedFiles.push(file);
      unprocessedFiles.splice(i, 1);
    }
  }
}

let allProcessorsContent = '// This file is generated.  Do not modify it directly! \n\n';
orderedFiles.forEach(file => allProcessorsContent += processorFilesInfo[file].content + '\n');

let allProcessorsFile = path.join(__dirname, '..', 'lib', 'allProcessors.js');

let fileHandle;
try {
  fileHandle = fs.openSync(allProcessorsFile, 'w');
  fs.writeFileSync(fileHandle, allProcessorsContent, 'utf8');
  console.log('Built ' + allProcessorsFile);
} catch (err) {
  console.error(err);
} finally {
  if (fileHandle !== undefined) {
    fs.closeSync(fileHandle);
  }
}