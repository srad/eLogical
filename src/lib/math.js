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

/**
 * Generates a truth table.
 * @param {Number} base
 * @param {Number} power
 * @param {Number} [depth]
 * @param {Array} [a]
 * @returns {Array}
 * @example
 * truthTable(2, 3) =>
 * [
 *   [false, false, false],
 *   [false, false, true],
 *   [false, true, false],
 *   [false, true, true],
 *   [true, false, false],
 *   [true, false, true],
 *   [true, true, false],
 *   [true, true, true],
 * ]
 */
function truthTable(base, power, depth = 0, a = []) {
  if (depth === 0) {
    for (let i = 0; i < base ** power; i++) {
      a.push(new Array(power).fill(false));
    }
  }
  if (a.length > 1) {
    const low = a.slice(0, a.length / 2);
    const high = a.slice(a.length / 2, a.length).map(row => {
      row[depth] = true;
      return row;
    });
    const lowRet = truthTable(base, power, depth + 1, low);
    const highRet = truthTable(base, power, depth + 1, high);
    a = lowRet.concat(highRet);
  }
  return a;
}

export {random, pick, truthTable};