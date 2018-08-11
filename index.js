const subject = require('./kefir/subject')
const { predicate, Copula } = require('./kefir/predication')
const { locative, genitive } = require('./kefir/case')
const { enumValues } = require('./kefir/functional')

const sentence = (subject, predicate, delimiter = ' ') => [subject, predicate].join(delimiter)

module.exports = {
  sentence,
  subject,
  predicate,
  Copula,
  locative,
  genitive,
  enumValues
}
