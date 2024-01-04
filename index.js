#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import readlineSync from 'readline-sync';

yargs(hideBin(process.argv))

  .command('apex', 'Group all Apex classes into one .txt file', async ({ argv }) => {
    validateArguments(argv);
    groupMetadata(argv, 'apexClasses.txt', '.cls');
  })

  .command('lwc', 'Group all LWC JavaScript files into one .txt file', async ({ argv }) => {
    validateArguments(argv);
    groupMetadata(argv, 'lwc.txt', '.js');

  })

  .command('flow', 'Group all FLOWs files into one .txt file', async ({ argv }) => {
    validateArguments(argv);
    groupMetadata(argv, 'flow.txt', '.flow-meta.xml');

  })

  .parse()


function validateArguments(argv) {
  const { p, o } = argv;

  if (!p) {
    console.error(`missed "-p" flag`);
    process.exit(1);
  } else if (!o) {
    console.error(`missed "-o" flag`);
    process.exit(1);
  }

  if(!fs.existsSync(p)) {
    console.error(`${p} is not a valid path`);
    
    process.exit(1);
  } else if (!fs.existsSync(o)) {
    console.error(`${o} is not a valid path`);
    
    process.exit(1);
  }
}

function groupMetadata(argv, fileName, fileExtension) {
  const { p, o } = argv;

  let filesContent = mergeAllFilesIntoOne(p, fileExtension);

  let outputFile = `${o}/${fileName}`;

  if (fs.existsSync(outputFile)) {
    const overwrite = readlineSync.question(`"${fileName}" file already exist, overwrite it? [y/n]`);

    if (overwrite !== 'y') return;
  }

  fs.writeFileSync(outputFile, filesContent);

  console.log(`"${fileName}" created`);
}

function mergeAllFilesIntoOne(path, fileExt) {
  let files = [];

  _getAllFiles(path);

  function _getAllFiles(path) {
      fs.readdirSync(path).forEach(item => {
          let itemPath = path + '/' + item;
    
          if (fs.statSync(itemPath).isDirectory()) {
              return _getAllFiles(itemPath);
          } else if (item.endsWith(fileExt)) {
            files.push({
              name: item,
              path: itemPath
            });
          }
      });
  }

  if (!files.length) {
    console.error(`"${fileExt}" files not found, please check provided path "${path}"`);
    process.exit(1);
  } else {
    console.log(`...found ${files.length} "${fileExt}" files`);
  }

  return files.reduce((total, file) => {
      let fileContent = fs.readFileSync(file.path, 'utf-8');
      
      total += `${file.name} \n ${fileContent} \n\n\n`;
      return total;
    }, '');
};