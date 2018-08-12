// from functools import reduce

const identity = x => x
const isTruthy = x => !!x
const NOTHING = ''
const toDict = namedTuple => namedTuple
const enumValues = x => Object.values(x)
const getEnumMember = (x, val) => x.find(y => y == val)
const join = (...x) => x.join(NOTHING)
const curry = (prior, ...additional) => (...args) => prior(...[...args, ...additional])
const skipFalsyAndJoin = (...x) => x.filter(isTruthy).join(NOTHING)

module.exports = {
  identity,
  isTruthy,
  NOTHING,
  toDict,
  enumValues,
  getEnumMember,
  join,
  curry,
  skipFalsyAndJoin
}
