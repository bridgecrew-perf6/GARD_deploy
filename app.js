#!/usr/bin/env node

const {exec} = require("child_process");
const fs = require('fs');
const AWS = require('aws-sdk');
require('dotenv').config()

const S3Bucket = process.env.bucket;

// AWS Setup
AWS.config.update(
    {
      region: 'us-east-2',
      accessKeyId: process.env.accessKeyId,
      secretAccessKey: process.env.secretAccessKey
    }
); // us-east-2 is Ohio


const s3 = new AWS.S3({apiVersion: '2006-03-01'});


const params = {
  Bucket: 'gard-rarediseases-json',
  Key: 'build/deploy.tar.gz'
};

console.log('Download static files');
const fileStream = s3.getObject(params).createReadStream();
const file = require('fs').createWriteStream('deploy.zip');
fileStream.pipe(file);


console.log('Unzip deploy.zip');
exec("tar -xf deploy.tar.gz -C /dist", (error, stdout, stderr) => {
  if (error) {
    console.log(`Unzip deploy.zip - error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`Unzip deploy.zip - stderr: ${stderr}`);
    return;
  }
  if(stdout) {
    console.log(`Unzip deploy.zip: ${stdout}`);
  }
});

