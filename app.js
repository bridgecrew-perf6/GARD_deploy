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

const FileName = process.env.filename | 'deploy.tar.gz';

const params = {
    Bucket: S3Bucket,
    Key: `build/${FileName}`
};

console.log(`Download ${FileName}`);
const fileStream = fs.createWriteStream(FileName);
const s3Stream = s3.getObject(params).createReadStream();

// Listen for errors returned by the service
s3Stream.on('error', function (err) {
    // NoSuchKey: The specified key does not exist
    console.error(err);
});

s3Stream.pipe(fileStream).on('error', function (err) {
    // capture any errors that occur when writing data to the file
    console.error('File Stream:', err);
}).on('close', function () {

    console.log(`Unzip ${FileName}`);
    exec(`tar -xf ${FileName}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`Unzip ${FileName} - error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`Unzip ${FileName} - stderr: ${stderr}`);
            return;
        }
        if (stdout) {
            console.log(`Unzip ${FileName}: ${stdout}`);
        }
    });

});



