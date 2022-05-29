import { forEach } from 'lodash-es';

/**
 * Converts key-value pairs to simple
 * string interpretation with \n as
 * separators.
 *
 * @param {object} json Simple key-value pairs
 * @returns {string} Beautified text
 */

export const jsonToText = (json) => {
  const text = [];

  forEach(json, (value, key) => {
    text.push(`${key.toUpperCase()}: ${value}`);
  });

  return text.join('\n');
};
