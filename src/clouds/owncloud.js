/*******************************************************************************
 * Copyright (C) 2018 Orange.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *    Rombit - initial API and implementation
 ******************************************************************************/

// const debug = require('debug-levels')('agile-data');
// const agile = require('./agile-sdk');
// const get = require('lodash/get');
const path = require('path');
const request = require('request');

module.exports = {
  endpointDescription: function () {
    return({
      "cloud": "owncloud",
    })
  },
  upload: function(credentials, remotepath,payload) {
    return new Promise(function(resolve, reject) {

      if (typeof remotepath !== 'undefined' && typeof remotepath !== "undefined"  && typeof payload !== "undefined") {
      let uploadConfig = {
        uploadContent: JSON.stringify(payload),
        uploadFileName: (typeof remotepath !== 'undefined') ? remotepath : dateFormat(new Date(), "yyyy.mm.dd") + "-Agile.txt",
        uploadDirectory: (typeof remotepath !== 'undefined') ? path.dirname(remotepath) : '',
        uploadDirectories: (typeof remotepath !== 'undefined') ? path.dirname(remotepath).split('/') : [],
        loopCount: 0
      };
        console.log("--- Owncloud upload data ---");
      console.log(uploadConfig);

      uploadToOwnCloud(uploadConfig, credentials, function (err) {
        if (err) {
          console.log("Owncloud: error uploading file");
          reject(err);
        }else{
          resolve( "upload complete")
        }
      });

      } else {
        reject("Owncloud: request invalid.");
      }
    });
  }
};
function uploadToOwnCloud(uploadConfig, credentials, cb) {
  let req = {
    method: 'PUT',
    uri: credentials.owncloudServer + '/remote.php/webdav/'+ uploadConfig.uploadFileName,
    auth: {
      username: credentials.clientId,
      password: credentials.clientSecret
    },
    timeout: 10000,
    body: uploadConfig.uploadContent
  };

  request(req, function (error, response, body) {
    if (error && (typeof response === "undefined" || typeof response.statusCode === "undefined")) {
      console.log("Owncloud: owncloud server response invalid");
      cb("Owncloud: owncloud server response invalid");
      return;
    }
    if (response.statusCode === 401) {
      cb("owncloud: unauthorized");
      return
    }else if (response.statusCode === 404 || response.statusCode === 409) {
      createFoldersOwnCloud(uploadConfig, credentials, function () {
        uploadToOwnCloud(uploadConfig, credentials, cb)
      }, function (err) {
        console.log("Owncloud:" + err);
        cb("Owncloud:" + err);
    });

    }else if(response.statusCode.toString().indexOf("2") !== 0) {
      let stripPrefix = function(str) {
        let prefixMatch = new RegExp(/(?!xmlns)^.*:/);
        return str.replace(prefixMatch, '');
      };
      let parser = new xml2js.Parser({ignoreAttrs: true,tagNameProcessors: [stripPrefix]});
      parser.parseString(body, function (err, result) {
        if (result && typeof result["error"]!== 'undefined' && typeof result["error"]["message"] !== 'undefined') {
          cb("file upload error" + result["error"]["message"]);
        }
        cb("file upload error" + body);
      });
    }else{
      cb(null);
    }
  });
}
function createFoldersOwnCloud(uploadConfig, credentials, cb,errorcb) {
  let mkdirReq = {
    method: 'MKCOL',
    uri: credentials.owncloudServer + '/remote.php/webdav/'+ uploadConfig.uploadDirectories.slice(0, uploadConfig.uploadDirectories.length - uploadConfig.loopCount).join('/'),
    timeout: 10000,
    auth: {
      username: credentials.clientId,
      password: credentials.clientSecret
    }
  };

  request(mkdirReq, function (error, response, body) {
    if ((response.statusCode === 404 || response.statusCode === 409) && ( uploadConfig.loopCount < uploadConfig.uploadDirectories.length)) {
      uploadConfig.loopCount += 1;
      createFoldersOwnCloud(uploadConfig, credentials, cb,errorcb);
    }else if(response.statusCode.toString().indexOf("2") === 0) {
      if (uploadConfig.loopCount === 0) {
        cb(null);
      } else {
        uploadConfig.loopCount -= 1;
        createFoldersOwnCloud(uploadConfig, credentials, cb, errorcb);
      }
    }else if ( uploadConfig.loopCount > uploadConfig.uploadDirectories.length){
      errorcb("uploadConfig.loopCount to high" + body);
    }else{
      errorcb("file upload error" + body);
    }
  });
}
