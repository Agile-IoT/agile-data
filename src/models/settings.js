/*******************************************************************************
 * Copyright (C) 2018 resin.io, and others
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
const mongoose = require('./mongoose');

const SettingsSchema = new mongoose.Schema({
  retention: { type: String, default: '7d' },
  updated_at: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;
