/*******************************************************************************
 *Copyright (C) 2017 Resin.io.
 *All rights reserved. This program and the accompanying materials
 *are made available under the terms of the Eclipse Public License v1.0
 *which accompanies this distribution, and is available at
 *http://www.eclipse.org/legal/epl-v10.html
 *
 *Contributors:
 *    Resin.io - initial API and implementation
 ******************************************************************************/
module.exports = {
  DB_NAME: 'agileDB',
  DB_RP_DURATION: '7d',
  DB_RP_NAME: 'defaultRP',
  PORT: '1338',
  DB_FILE: process.env.DB_FILE || `${__dirname}/data/db.json`
};
