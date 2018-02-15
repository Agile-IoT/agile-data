/*******************************************************************************
 * Copyright (C) 2018 resin.io, and others
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
const isProd = () => {
  return process.env.NODE_ENV === 'production';
};

module.exports = {
  PORT: '1338',
  AGILE_API: isProd() ? 'http://agile-core:8080' : 'http://localhost:9999',
  AGILE_IDM: isProd() ? 'http://agile-security:3000' : 'http://localhost:3000',
  AGILE_DATA: isProd() ? 'http://agile-data:1338' : 'http://localhost:1338'
};
