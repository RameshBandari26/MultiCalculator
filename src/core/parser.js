const FUNCTIONS = {
  sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan,
  log: Math.log10, ln: Math.log, abs: Math.abs,
};
const MAX_LENGTH = 200;
const MAX_DEPTH = 50;

/**
 * Safely evaluate an arithmetic expression (no eval / Function).
 * Supports + - * / ^ % ( ), sqrt sin cos tan log ln abs, constants pi and e. Trig uses radians.
 * @param {string} source
 * @returns {number}
 * @throws {Error} On unsupported syntax, division by zero, domain errors or non-finite results.
 */
export function evaluateExpression(source) {
  if (source.length > MAX_LENGTH) throw new Error(`Expression too long (max ${MAX_LENGTH} characters)`);
  const tokens = source.toLowerCase().match(/\d*\.?\d+(?:e[+-]?\d+)?|[a-z]+|[-+*/^()%]/g) || [];
  if (!tokens.length || tokens.join('') !== source.toLowerCase().replace(/\s/g, '')) {
    throw new Error('Unsupported characters in expression');
  }
  let position = 0;
  let depth = 0;
  const peek = () => tokens[position];
  const next = () => tokens[position++];

  function parseSum() {
    let value = parseProduct();
    while (peek() === '+' || peek() === '-') {
      const operator = next();
      const right = parseProduct();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }
  function parseProduct() {
    let value = parseUnary();
    while (peek() === '*' || peek() === '/') {
      const operator = next();
      const right = parseUnary();
      if (operator === '/' && right === 0) throw new Error('Division by zero');
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  }
  function parseUnary() {
    if (peek() === '-') { next(); return -parseUnary(); }
    return parsePower();
  }
  function parsePower() {
    const base = parsePercent();
    if (peek() === '^') { next(); return Math.pow(base, parseUnary()); }
    return base;
  }
  function parsePercent() {
    let value = parsePrimary();
    while (peek() === '%') { next(); value /= 100; }
    return value;
  }
  function parsePrimary() {
    if (++depth > MAX_DEPTH) throw new Error('Expression too deeply nested');
    const token = next();
    let value;
    if (token === undefined) throw new Error('Unexpected end of expression');
    if (token === '(') {
      value = parseSum();
      if (next() !== ')') throw new Error('Missing closing parenthesis');
    } else if (token === 'pi') value = Math.PI;
    else if (token === 'e') value = Math.E;
    else if (FUNCTIONS[token]) {
      if (next() !== '(') throw new Error(`${token} needs parentheses`);
      const argument = parseSum();
      if (next() !== ')') throw new Error('Missing closing parenthesis');
      if (token === 'sqrt' && argument < 0) throw new Error('Square root of a negative number is not real');
      if ((token === 'log' || token === 'ln') && argument <= 0) throw new Error('Logarithm needs a positive number');
      value = FUNCTIONS[token](argument);
    } else if (/^[\d.]/.test(token)) value = Number(token);
    else throw new Error(`Unexpected “${token}”`);
    depth--;
    return value;
  }

  const result = parseSum();
  if (position < tokens.length) throw new Error(`Unexpected “${tokens[position]}”`);
  if (!Number.isFinite(result)) throw new Error('Result is not a finite number');
  return result;
}
