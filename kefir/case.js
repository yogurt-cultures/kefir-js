/*
# Grammatical Cases

Implemented only six grammatical cases.

  - Nominative
  - Genitive
  - Dative
  - Accusative
  - Ablative
  - Locative

Turkish has 9 more cases.

  - Essive
  - Instrumental
  - Inclusive
  - Abessive
  - Likeness
  - Coverage
  - Qualitative
  - Conditional
  - Possesive

Detailed explaination:
https://en.wikibooks.org/wiki/Turkish/Cases

TODO: Enum'lardaki rakamlar yerine auto() kullanılmalı.
*/

const {
  skipFalsyAndJoin, NOTHING
} = require('./functional')
const Suffix = require('./suffix')
const {
  getLastVowel,
  getVowelSymbol,
  Front,
  Back,
  isBack,
  voice,
  isFront,
  endsWithConsonant,
  endsWithVoiceless,
  SOFTENING_SOUNDS,
  // VOICELESS_CONSONANTS,
  UNROUNDED_BACK_VOWELS,
  ROUNDED_BACK_VOWELS,
  UNROUNDED_FRONT_VOWELS,
  ROUNDED_FRONT_VOWELS
} = require('./phonology')

const GrammaticalCase = {
  NOMINATIVE: 1,
  GENITIVE: 2,
  DATIVE: 3,
  ACCUSATIVE: 4,
  ABLATIVE: 5,
  LOCATIVE: 6
}

const getCaseProcessor = caseValue => {
  const GrammaticalCaseProcessors = {
    [GrammaticalCase.NOMINATIVE]: nominative,
    [GrammaticalCase.ABLATIVE]: ablative,
    [GrammaticalCase.ACCUSATIVE]: accusative,
    [GrammaticalCase.GENITIVE]: genitive,
    [GrammaticalCase.DATIVE]: dative,
    [GrammaticalCase.LOCATIVE]: locative
  }

  return GrammaticalCaseProcessors[caseValue]
}

/*
## nominative case (yalın in turkish)
the simplest grammatical case, there's no suffix to
affix in that case.

nominative comes from latin cāsus nominātīvus
means case for naming.
*/
const nominative = text => text

/*
## ablative case (ayrılma in turkish)
a grammatical case for nouns, pronouns and adjectives in
  the grammar of various languages; it is sometimes used to
express motion away from something, among other uses.

✎︎ examples
  ```
  adalar[dan] geldim
  merkez[den] geçtim
  teyit[ten] geçtim
  açlık[tan] öldüm
  ```
*/
const ablative = text => {
  let suffix = ''

  if (endsWithVoiceless(text)) {
    suffix = isBack(text) ? Suffix.TAN : Suffix.TEN
  } else {
    suffix = isBack(text) ? Suffix.DAN : Suffix.DEN
  }

  return text + suffix
}

/*
## accusative(ilgi in turkish)
The accusative case (abbreviated acc) of a noun is the
grammatical case used to mark the direct object of a
transitive verb.The same case is used in many
languages for the objects of(some or all) prepositions.

✎︎ examples
  ```
  aday[ı] yedim
  evim[i] yaptım
  üzüm[ü] pişirdim
  ```
*/
const accusative = (text, voicer = voice) => {
  const lastVowel = getLastVowel(text)
  const sound = getVowelSymbol(lastVowel)

  const map = [
    [UNROUNDED_BACK_VOWELS, Back.I],
    [UNROUNDED_FRONT_VOWELS, Front.I],
    [ROUNDED_BACK_VOWELS, Back.U],
    [ROUNDED_FRONT_VOWELS, Front.U]
  ]

  for (let [vowels, affix] of map) {
    if (vowels.includes(sound)) {
      return skipFalsyAndJoin(
        voicer(text),

        // if ends with a vowel, echo the genitive
        // sound ⟨n⟩ right before the voiced suffix
        // !ends_with_consonant(text) ? Suffix.Y : NOTHING,
        affix
      )
    }
  }
}

/*
## genitive case (genitifler in turkish)
In grammar, the genitive is the grammatical case
that marks a word, usually a noun, as modifying
another word, also usually a noun.

✎︎ examples
  ```
  hanımelinin çiçeği (flower of a plant called hanımeli)
  kadının ayakkabısı (shoes of the woman)
  باب بيت bābu baytin (the door of a house)
  mari[i] nie ma w domu (maria is not at home)
  ```
*/
const genitive = text => {
  const lastVowel = getLastVowel(text)
  const sound = getVowelSymbol(lastVowel)

  const map = [
    [UNROUNDED_BACK_VOWELS, Back.I],
    [UNROUNDED_FRONT_VOWELS, Front.I],
    [ROUNDED_BACK_VOWELS, Back.U],
    [ROUNDED_FRONT_VOWELS, Front.U]
  ]

  for (let [vowels, affix] of map) {
    if (vowels.includes(sound)) {
      return skipFalsyAndJoin(
        // nominative form
        voice(text),

        // if ends with a vowel, echo the genitive
        // sound ⟨n⟩ right before the voiced suffix
        !endsWithConsonant(text) ? Suffix.N : NOTHING,

        // ⟨a⟩ ⟨i⟩ ⟨u⟩ ⟨ü⟩
        affix,

        // genitive sound ⟨n⟩
        Suffix.N
      )
    }
  }
}

/*
## dative case (yönelme in turkish)
In some languages, the dative is used to mark the
indirect object of a sentence.

✎︎ examples
  ```
  marya yakup'a bir drink verdi (maria gave jacob a drink)
  maria jacobī potum dedit (maria gave jacob a drink)
  ```
*/
const dative = text => {
  const lastVowel = getLastVowel(text)
  // const sound = getVowelSymbol(lastVowel)
  const symbol = isFront(lastVowel) ? Front.E : Back.A

  return skipFalsyAndJoin(
    // nominative form
    voice(text),

    // if ends with a vowel, echo the genitive
    // sound ⟨y⟩ right before the voiced suffix
    !endsWithConsonant(text) ? Suffix.Y : NOTHING,

    // ⟨e⟩ ⟨a⟩
    symbol,
  )
}

/*
## locative case (bulunma in turkish)
Locative is a grammatical case which indicates a location.
It corresponds vaguely to the English prepositions "in",
  "on", "at", and "by".

✎︎ examples
  ```
  bahçe[de] hanımeli var.
  yorum[da] iyi beatler var.
  kalem[de] güzel uç var.
  ```
*/
const locative = text => {
  const lastVowel = getLastVowel(text)
  const symbol = isFront(lastVowel) ? Front.E : Back.A

  return skipFalsyAndJoin(
    text,

    // ⟨d⟩ or ⟨t⟩
    (text.slice(-1) in SOFTENING_SOUNDS) ? Suffix.T : Suffix.D,

    // ⟨e⟩ or ⟨a⟩
    symbol,
  )
}

module.exports = {
  GrammaticalCase,
  getCaseProcessor,
  locative
}
