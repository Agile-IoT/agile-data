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
    return {
      cloudName: "owncloud",
      requiredFields : [{
        displayName: "Username",
        name: "clientId",
        description: "The username used for authentication against the OwnClowd instance."
      }, {
        displayName: "Password",
        name: "clientSecret",
        description: "The password used for authentication against the OwnClowd instance."
      }, {
        displayName: "Upload Path",
        name: "uploadPath",
        description: "What file should the data be uploaded to?"
      }, {
        displayName: "ownCloud Server Url",
        name: "owncloudServer",
        description: "The url of your ownCloud instance."
      }]
    }
  },

  upload: async (customArgs, data) => {
    if (!customArgs) {
      throw new Error('no credentials provided');
    }

    const { uploadPath, clientId, clientSecret, owncloudServer } = customArgs

    if (!uploadPath || !data) {
      throw new Error('Owncloud: request invalid')
    }

    if(!clientId || !clientSecret || !owncloudServer) {
      throw new Error('incomplete credentials, please provide the clientId, clientSecret, and ownCloudServer')
    }

    const uploadConfig = {
      uploadContent: JSON.stringify(data),
      uploadFileName: uploadPath,
      uploadDirectory: path.dirname(uploadPath),
      uploadDirectories: path.dirname(uploadPath).split('/'),
      loopCount: 0
    };

    return uploadToOwnCloud(uploadConfig, customArgs)
  }
};

uploadToOwnCloud = async (uploadConfig, customArgs) => {
  const { owncloudServer, clientId, clientSecret } = customArgs
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
      await createFoldersOwnCloud(uploadConfig, customArgs)
      await uploadToOwnCloud(uploadConfig, customArgs)
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

createFoldersOwnCloud = async (uploadConfig, customArgs) => {
  const {owncloudServer, clientId, clientSecret} = customArgs
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
      createFoldersOwnCloud(uploadConfig, customArgs)
    }
  } catch (error) {
    const { status } = error.response
    const shouldRecurse = uploadConfig.loopCount < uploadDirectories.length

    if ((status === 404 || status === 409) && shouldRecurse) {
      uploadConfig.loopCount += 1
      await createFoldersOwnCloud(uploadConfig, customArgs)
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
