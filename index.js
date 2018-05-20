'use strict';

var im = require('imagemagick');
var os = require('os');
var fs = require('fs');

const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    "region": "us-east-1"
});
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});

const BUCKET = process.env.BUCKET;
const URL = process.env.URL;

function generateImage(s3Data,width,height,obkey,cback){

  // console.log(s3Data);

  var imgData = s3Data.Body;
  var params = {};
  var resizedFile = os.tmpdir() + '/' + Math.round(Date.now() * Math.random() * 10000);
  var imgQuality=0.7;
  if(width < 600) {
    imgQuality=0.8
  }

  if(s3Data.ContentType == 'image/png') {
    params = {
      format: 'png'
    };
    resizedFile += ".png";
  } else {
    params = {
      quality:imgQuality
    };
    resizedFile += ".jpg";
  }

  params['srcData'] = imgData;
  params['dstPath'] = resizedFile;
  params['width']   = width;
  params['height']  = height;

  // console.log(params);
  var buffer = im.resize(params, function(err, stdout, stderr){
    if (err) throw err;
    sendToBucket(resizedFile,obkey,cback);
  });

}

function sendToBucket(buffer,obkey,cback){
  fs.readFile(buffer, function (err, data) {
    if (err) { throw err; }


    S3.putObject({
        Body: data,
        Bucket: BUCKET,
        ContentType: 'image/jpg',
        Key: obkey,
     }, function(err, data){
        cback(null, {
          statusCode: '301',
          headers: {'location': URL+obkey
        },
          body: '',
        })

     });

  });

//  fs.writeFileSync('kidd.jpg', stdout, 'binary');

}

exports.handler = function(event, context, callback) {
  const key = event.queryStringParameters.key;
  const match = key.match(/(.*)\/(\d+)x(\d+)\/([^?]*)/);

  if(!match) {
    throw "Invalid URI: "+ key;
  }

  var width = parseInt(match[2], 10);
  var height = parseInt(match[3], 10);
  if(height==0){
    height=width/(width/height);
  }

  const originalKey = match[1]+"/"+match[4];
  const destKey= match[1]+"/" + match[2] + "x" + match[3] + "/" +match[4]

  S3.getObject({Bucket: BUCKET, Key: originalKey}).promise()
    .then(data => generateImage(data,width,height,destKey,callback))
}
