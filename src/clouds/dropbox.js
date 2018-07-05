/*******************************************************************************
 * Copyright (C) 2018 Atos, and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *    Atos - initial API and implementation
 ******************************************************************************/
const dropbox = require('dropbox')
const d = require('debug-levels')('agile-data-dropbox')
require('isomorphic-fetch');

module.exports = {
  endpointDescription: () => {
    return {
      cloudName: "dropbox",
      requiredFields : [{
        displayName: "OAuth2 token",
        name: "token",
        description: ""
      },{
        displayName: "Upload Path",
        name: "uploadPath",
        description: ""
      }]
    }
  },

  /*
   * Uploads a file to Dropbox.
   * - customArgs (object):
   *   - uploadPath: Path in the user's Dropbox to save the file.
   *     (it must start with '/')
   *   - token: OAuth2 token
   * - data: JSON object to store in file
   */
  upload: async (customArgs, data) => {
    if (!customArgs) {
      throw new Error('no credentials provided');
    }

    const { uploadPath, token } = customArgs

    if (!uploadPath || !data) {
      throw new Error('Dropbox: request invalid')
    }

    if(!token) {
      throw new Error('incomplete credentials, please provide the OAuth2 token')
    }

    const dxPath = uploadPath.startsWith("/")? uploadPath : "/" + uploadPath

    const uploadConfig = {
      uploadContent: JSON.stringify(data),
      uploadPath: dxPath,
      loopCount: 0
    };

    return uploadToDropbox(uploadConfig, customArgs)
  }
};

uploadToDropbox = async (uploadConfig, customArgs) => {
  const { token } = customArgs
  const { uploadPath, uploadContent } = uploadConfig

  try {
    const api = new dropbox.Dropbox({ accessToken: token });
    await api.filesUpload(
      {
         contents: uploadContent,
         path: uploadPath,
         mode: { ".tag": "overwrite"},
         autorename: false,
         mute: false
      }
    )
    return
  } catch (error) {
    var msg;
    if (typeof error.error === "string") {
        // malformed token, wrong path...
        msg = error.error
    } else if (error.error && error.error.error_summary) {
        // invalid access token
        msg = error.error.error_summary
    } else {
        // sanity check
        msg = JSON.stringify(error)
    }
    throw Error(`Dropbox: ${msg}`)
  }
}
