/*
# Turkish phonology

In Hungarian, Finnish, and Turkic languages
vowel sounds are organized in a concept called
vowel harmony.Vowels may be classified as Back
or Front vowels, based on the placement of the
sound in the mouth.

```
 Front Vowels
+----------------+
 Unrounded  ⟨e⟩ ⟨i⟩
 Rounded    ⟨ü⟩ ⟨ö⟩

 Back Vowels
+----------------+
 Unrounded  ⟨a⟩ ⟨ı⟩
 Rounded    ⟨u⟩ ⟨o⟩
```

TODO: Document consonant harmony.
*/

const { enumValues, join, NOTHING } = require('./functional')

const Front = {
  E: 'e',
  I: 'i',
  U: 'ü',
  O: 'ö'
}

const Back = {
  A: 'a',
  I: 'ı',
  U: 'u',
  O: 'o'
}

const ROUNDED_FRONT_VOWELS = [
  Front.U, Front.O
]

const UNROUNDED_FRONT_VOWELS = [
  Front.E, Front.I
]

const ROUNDED_BACK_VOWELS = [
  Back.U, Back.O
]

const UNROUNDED_BACK_VOWELS = [
  Back.A, Back.I
]

const ROUNDED_VOWELS = [...ROUNDED_BACK_VOWELS, ...ROUNDED_FRONT_VOWELS]

const CONTINUANT_VOICED = [
  'ğ', 'j', 'l', 'm',
  'n', 'r', 'v', 'y',
  'z'
]

const NON_CONTINUANT_VOICED = [
  'b', 'c', 'd', 'g'
]

const VOICELESS_CONTINUANT = [
  'p', 'ç', 't', 'k'
]

const VOICELESS_NON_CONTINUANT = [
  'f', 'h', 's', 'ş'
]

// FISTIKÇI ŞAHAP 👳
const VOICELESS_CONSONANTS = [...VOICELESS_CONTINUANT, ...VOICELESS_NON_CONTINUANT]

const VOICED_CONSONANTS = [...CONTINUANT_VOICED, ...NON_CONTINUANT_VOICED]

const CONSONANTS = [...VOICED_CONSONANTS, ...VOICELESS_CONSONANTS]

const SOFTENING_SOUNDS = {
  p: 'b',
  ç: 'c',
  t: 'd',
  k: 'ğ'
}

const HARDENING_SOUNDS = {
  p: 'b',
  ç: 'c',
  t: 'd',
  k: 'ğ'
}

class MissingVowelSound extends Error { }

const endsWithConsonant = text => CONSONANTS.includes(text.slice(-1))

const endsWithVoiceless = text => VOICELESS_CONSONANTS.includes(text.slice(-1))

const getVowelSymbol = vowel => {
  if (enumValues(Front).includes(vowel)) return vowel
  if (enumValues(Back).includes(vowel)) return vowel
}

const getLastVowel = text => {
  for (let symbol of text.split(NOTHING).reverse()) {
    if (enumValues(Front).includes(symbol)) return symbol
    if (enumValues(Back).includes(symbol)) return symbol
  }

  throw MissingVowelSound
}

const determineVowelHarmony = text => {
  for (let sound of text.split(NOTHING).reverse()) {
    if (enumValues(Front).includes(sound)) return Front
    if (enumValues(Back).includes(sound)) return Back
  }

  throw MissingVowelSound
}

const isFront = text => determineVowelHarmony(text) == Front
const isBack = text => determineVowelHarmony(text) == Back
const isRounded = text => ROUNDED_VOWELS.includes(getVowelSymbol(getLastVowel(text)))
const harmony = sound => {
  const map = [
    [UNROUNDED_BACK_VOWELS, Back.I],
    [UNROUNDED_FRONT_VOWELS, Front.I],
    [ROUNDED_BACK_VOWELS, Back.U],
    [ROUNDED_FRONT_VOWELS, Front.U]
  ]

  for (let [vowels, affix] of map) {
    if (vowels.includes(sound)) { return affix }
  }
}

/*
#### swap_front_and_back
Swaps front sounds to back, and vice versa
  ```python
  >>> swap_front_and_back('acak')
  'ecek'
  >>> swap_front_and_back('ocok')
  'öcök'
  >>> swap_front_and_back('öcök')
  'ocok'
  >>> swap_front_and_back('acak')
  'ecek'
  ```
*/
const swapFrontAndBack = text => {
  let vowelSet = []

  if (isFront(text)) {
    vowelSet = [Front, Back]
  } else {
    vowelSet = [Back, Front]
  }

  const symbols = text.split('').map(symbol => {
    try {
      determineVowelHarmony(symbol)
    } catch (e) {
      return symbol
    }

    const index = Object.values(vowelSet[0]).indexOf(symbol)
    return Object.values(vowelSet[1])[index]
  })

  return symbols.join('')
}

/*
## Voicing or sonorization(yumuşama in turkish)
to make pronouncation easier, nouns ending
with these sounds.

  ```
  ⟨p⟩ ⟨ç⟩ ⟨t⟩ ⟨k⟩
  ```

may be softened by replacing them in order:

```
  ⟨b⟩ ⟨c⟩ ⟨d⟩ ⟨ğ⟩
  ```

✎︎ examples
  ```
  ço⟨p⟩un → ço⟨b⟩un
  ağa⟨ç⟩ın → ağa⟨c⟩n
  kağı⟨t⟩ın → kağı⟨d⟩ın
  ren⟨k⟩in → ren⟨g⟩in
  ```

✎︎ examples in other languages
  ```
  li⟨f⟩e → li⟨v⟩e
  stri⟨f⟩e → stri⟨v⟩e
  proo⟨f⟩ → pro⟨v⟩e
  ```
*/
const voice = text => {
  for (let sound in SOFTENING_SOUNDS) {
    if (text.endsWith(sound)) {
      return join(text.slice(0, -1), SOFTENING_SOUNDS[sound])
    }
  }

  return text
}

/*
## Devoicing or desonorization(sertleşme in turkish)
to make pronouncation easier, nouns ending with
  these sounds:
```
  ⟨p⟩ ⟨ç⟩ ⟨t⟩ ⟨k⟩
  ```

may be hardened by replacing them in order:
```
  ⟨b⟩ ⟨c⟩ ⟨d⟩ ⟨ğ⟩
  ```

✎︎ examples
  ```
  ço⟨p⟩un → ço⟨b⟩un
  ağa⟨ç⟩ın → ağa⟨c⟩n
  kağı⟨t⟩ın → kağı⟨d⟩ın
  ren⟨k⟩in → ren⟨g⟩in
  ```

✎︎ examples in other languages
  ```
  dogs → dogs ([ɡz])
  missed → missed ([st])
  whizzed → whizzed ([zd])
  prośba → prɔʑba
  просьба → prozʲbə
  ```
*/
const devoice = text => {
  for (let sound in SOFTENING_SOUNDS) {
    if (text.endsWith(sound)) {
      return join(text.slice(0, -1), SOFTENING_SOUNDS[sound])
    }
  }

  return text
}

module.exports = {
  getLastVowel,
  getVowelSymbol,
  Front,
  Back,
  isBack,
  voice,
  isFront,
  isRounded,
  harmony,
  devoice,
  swapFrontAndBack,
  endsWithConsonant,
  endsWithVoiceless,
  SOFTENING_SOUNDS,
  HARDENING_SOUNDS,
  VOICELESS_CONSONANTS,
  UNROUNDED_BACK_VOWELS,
  ROUNDED_BACK_VOWELS,
  UNROUNDED_FRONT_VOWELS,
  ROUNDED_FRONT_VOWELS
}
