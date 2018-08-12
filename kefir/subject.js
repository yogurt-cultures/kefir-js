const { GrammaticalCase, getCaseProcessor } = require('./case')
const { isFront } = require('./phonology')
const { join, NOTHING } = require('./functional')
const Suffix = require('./suffix')

const subject = (stem, isPlural = false, caseValue = GrammaticalCase.NOMINATIVE) => {
  let suffix = NOTHING

  if (isPlural) {
    suffix = isFront(stem) ? Suffix.LER : Suffix.LAR
  }

  const processor = getCaseProcessor(caseValue)

  return processor(join(stem, suffix))
}

module.exports = subject
