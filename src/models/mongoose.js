/*******************************************************************************
 * Copyright (C) 2018 resin.io, and others
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
const mongoose = require('mongoose');
const Promise = require('bluebird');

mongoose.connect('mongodb://localhost/agile-data', {
  useMongoClient: true,
  promiseLibrary: Promise
});

module.exports = mongoose;
