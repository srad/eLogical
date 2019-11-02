/**
 * @param {Number} min
 * @param {Number} max
 * @returns {*}
 */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {String|Array} sequence
 * @returns {*}
 */
function pick(sequence) {
  return sequence[random(0, sequence.length - 1)];
}

export {random, pick};