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
const path = require('path')
const axios = require('axios')

module.exports = {
  endpointDescription: () => {
    return { "cloud": "owncloud", }
  },

  upload: (credentials, remotepath, payload) => {
    if (!remotepath || !payload) {
      return reject('Owncloud: request invalid')
    }

    const uploadConfig = {
      uploadContent: JSON.stringify(payload),
      uploadFileName: remotepath, 
      uploadDirectory: path.dirname(remotepath),
      uploadDirectories: path.dirname(remotepath).split('/'),
      loopCount: 0
    };

    console.log("--- Owncloud upload data ---");
    console.log(uploadConfig);

    return uploadToOwnCloud(uploadConfig, credentials)
  }
};

uploadToOwnCloud = (uploadConfig, credentials) => {
  const { owncloudServer, clientId, clientSecret } = credentials
  const { uploadFileName, uploadContent } = uploadConfig

  const req = {
    method: 'PUT',
    uri: `${owncloudServer}/remote.php/webdav/${uploadFileName}`,
    auth: {
      username: clientId,
      password: clientSecret
    },
    timeout: 10000,
    body: uploadContent
  };

  return axios(req)
    .catch(error => {
      const {status, data} = error.response

      if (status === 404 || status === 409) {
        return createFoldersOwnCloud(uploadConfig, credentials)
          .then(uploadToOwnCloud(uploadConfig, credentials))
      }

      if (status < 200 && status > 299) {
        const errorMsg = parseXmlResponse(data)
        throw new Error(errorMsg)
      }

      throw new error('Owncloud: error during request to server')
    })
}

createFoldersOwnCloud = (uploadConfig, credentials) => {
  const {owncloudServer, clientId, clientSecret} = credentials
  const {uploadDirectories, loopCount} = uploadConfig

  const folderPath = uploadDirectories.slice(0, uploadDirectories.length - loopCount).join('/')

  const mkdirReq = {
    method: 'MKCOL',
    uri: `${owncloudServer}/remote.php/webdav/${folderPath}`,
    timeout: 10000,
    auth: {
      username: clientId,
      password: clientSecret
    }
  };

  return axios(mkdirReq)
    .then(result => {
      if (loopCount === 0) {
        return
      }

      uploadConfig.loopCount -= 1
      return createFoldersOwnCloud(uploadConfig, credentials)
    })
    .catch(err => {
      const {status} = error.response
      const canRecurse = loopCount < uploadDirectories.length

      if ((status === 404 || status === 409) && canRecurse) {
        uploadConfig.loopCount -= 1
        return createFoldersOwnCloud(uploadConfig, credentials)
      }

      if (!canRecurse) {
        throw new Error('uploadConfig.loopCount to high')
      }
    })
}

parseXmlResponse = (body) => {
  const parser = new xml2js.Parser({
    ignoreAttrs: true,
    tagNameProcessors: [(name) => name.replace(new RegExp(/(?!xmlns)^.*:/), '')]
  })

  parser.parseString(body, (err, result) => {
    if (result && result.error && result.error.message) {
      throw new Error(result.error.message)
    }

    return body
  })
}
