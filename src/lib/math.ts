function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(sequence: T[]): T {
  return sequence[random(0, sequence.length - 1)];
}

function truthTable(
  base: number,
  power: number,
  depth: number = 0,
  a: boolean[][] = []
): boolean[][] {
  if (depth === 0) {
    for (let i = 0; i < base ** power; i++) {
      a.push(new Array(power).fill(false));
    }
  }

  if (a.length > 1) {
    const low = a.slice(0, a.length / 2);
    const high = a.slice(a.length / 2, a.length).map((row) => {
      row[depth] = true;
      return row;
    });
    const lowRet = truthTable(base, power, depth + 1, low);
    const highRet = truthTable(base, power, depth + 1, high);
    a = lowRet.concat(highRet);
  }

  return a;
}

export { random, pick, truthTable };
