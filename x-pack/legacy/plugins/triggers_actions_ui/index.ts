/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Legacy } from 'kibana';
import { Root } from 'joi';
import { resolve } from 'path';

export function triggersActionsUI(kibana: any) {
  return new kibana.Plugin({
    id: 'triggers_actions_ui',
    configPrefix: 'xpack.triggers_actions_ui',
    isEnabled(config: Legacy.KibanaConfig) {
      return (
        config.get('xpack.triggers_actions_ui.enabled') &&
        (config.get('xpack.actions.enabled') || config.get('xpack.alerting.enabled'))
      );
    },
    publicDir: resolve(__dirname, 'public'),
    require: ['kibana'],
    config(Joi: Root) {
      return Joi.object()
        .keys({
          enabled: Joi.boolean().default(true),
        })
        .default();
    },
    uiExports: {
      styleSheetPaths: resolve(__dirname, 'public/index.scss'),
    },
  });
}
