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
const xml2js = require('xml2js')

module.exports = {
  endpointDescription: () => {
    return { "cloud": "owncloud" }
  },

  upload: async (credentials, remotepath, payload) => {
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

    return uploadToOwnCloud(uploadConfig, credentials)
  }
};

uploadToOwnCloud = async (uploadConfig, credentials) => {
  const { owncloudServer, clientId, clientSecret } = credentials
  const { uploadFileName, uploadContent } = uploadConfig

  const req = {
    method: 'PUT',
    url: `${owncloudServer}/remote.php/webdav/${uploadFileName}`,
    auth: {
      username: clientId,
      password: clientSecret
    },
    timeout: 10000,
    data: uploadContent
  };

  try {
    await axios(req)
    return
  } catch (error) {
    const {status, data} = error.response

    if (status === 404 || status === 409) {
      await createFoldersOwnCloud(uploadConfig, credentials)
      await uploadToOwnCloud(uploadConfig, credentials)
      return
    }

    if (status < 200 || status > 299) {
      let errorMsg = data
      try {
        errorMsg = await parseXmlResponse(data)
      } catch(err) {}
      throw new Error(errorMsg)
    }

    throw new Error('Owncloud: error during request to server')
  }
}

createFoldersOwnCloud = async (uploadConfig, credentials) => {
  const {owncloudServer, clientId, clientSecret} = credentials
  const {uploadDirectories} = uploadConfig

  const folderPath = uploadDirectories
    .slice(0, uploadDirectories.length - uploadConfig.loopCount)
    .join('/')

  const mkdirReq = {
    method: 'MKCOL',
    url: `${owncloudServer}/remote.php/webdav/${folderPath}`,
    timeout: 10000,
    auth: {
      username: clientId,
      password: clientSecret
    }
  };

  try {
    await axios(mkdirReq)
    if (uploadConfig.loopCount === 0) {
      return
    } else {
      uploadConfig.loopCount -= 1
      createFoldersOwnCloud(uploadConfig, credentials)
    }
  } catch (error) {
    const { status } = error.response
    const shouldRecurse = uploadConfig.loopCount < uploadDirectories.length

    if ((status === 404 || status === 409) && shouldRecurse) {
      uploadConfig.loopCount += 1
      await createFoldersOwnCloud(uploadConfig, credentials)
      return
    }

    if (!shouldRecurse) {
      throw new Error('uploadConfig.loopCount to high')
    }
  }
}

parseXmlResponse = async (body) => {
  const stripPrefix = (str) => {
    const prefixMatch = new RegExp(/(?!xmlns)^.*:/);
    return str.replace(prefixMatch, '');
  };

  const parser = new xml2js.Parser({
    ignoreAttrs: true,
    tagNameProcessors: [stripPrefix]
  });

  return new Promise((resolve, reject) => {
    parser.parseString(body, (err, result) => {
      if (result && result.error && result.error.message) {
        resolve(result.error.message)
      }

      if (err) {
        reject()
      }
    })
  })
}
