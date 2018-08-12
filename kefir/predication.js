/*
# Turkish Predication and Copula

turkish language copulas, which are called as ek-eylem which
literally means 'suffix-verb' are one of the most distinct
features of turkish grammar.

TODO: Remove unused imports.
*/

const {
  join,
  skipFalsyAndJoin,
  NOTHING
} = require('./functional')

const Suffix = require('./suffix')
const {
  getLastVowel,
  getVowelSymbol,
  Back,
  Front,
  isFront,
  voice,
  endsWithConsonant,
  endsWithVoiceless,
  UNROUNDED_BACK_VOWELS,
  ROUNDED_BACK_VOWELS,
  UNROUNDED_FRONT_VOWELS,
  ROUNDED_FRONT_VOWELS,
  harmony,
  swapFrontAndBack
} = require('./phonology')

const Person = {
  FIRST: 'first',
  SECOND: 'second',
  THIRD: 'third'
}

const Copula = {
  NEGATIVE: 'negative',
  ZERO: 'zero',
  TOBE: 'tobe',
  PERSONAL: 'personal',
  PERFECTIVE: 'perfective',
  IMPERFECTIVE: 'imperfective',
  PROGRESSIVE: 'progressive',
  NECESSITATIVE: 'necessitative',
  FUTURE: 'future',
  IMPOTENTIAL: 'impotential',
  CONDITIONAL: 'conditional'
}

const getCopulaProcessor = copula => {
  const CopulaProcessors = {
    [Copula.NEGATIVE]: negative,
    [Copula.ZERO]: zero,
    [Copula.TOBE]: tobe,
    [Copula.PERSONAL]: personal,
    [Copula.PERFECTIVE]: perfective,
    [Copula.IMPERFECTIVE]: imperfective,
    [Copula.PROGRESSIVE]: progressive,
    [Copula.NECESSITATIVE]: necessitative,
    [Copula.FUTURE]: future,
    [Copula.IMPOTENTIAL]: impotential,
    [Copula.CONDITIONAL]: conditional
  }

  return CopulaProcessors[copula]
}

/*
  #### zero copula
  is the rule for third person, as in hungarian
  and russian. that means two nouns, or a noun and an
  adjective can be juxtaposed to make a sentence without
  using any copula. third person plural might be indicated
  with the use of plural suffix "-lar/-ler".

  ✎︎ examples
  ```
  yogurt kültür (yogurt [is-a] culture)
  abbas yolcu (abbas [is-a] traveller)
  evlerinin önü yonca (the front of their home [is-a] plant called yonca)
  ```

  ✎︎ tests
  ```python
  >>> zero('yolcu')
  'yolcu'

 ```
*/
const zero = (predicate, person = Person.THIRD, isPlural = false) => predicate

/*
  '''
  #### negative
  negation is indicated by the negative copula değil.
  değil is never used as a suffix, but it takes suffixes
  according to context.

  ✎︎ examples
  ```
  yogurt kültür değildir (yogurt [is-not-a] culture)
  abbas yolcu değildir (abbas [is-not-a] traveller)
  evlerinin önü yonca değildir (the front of their home [is-not-a] yonca)
  ```

  ✎︎ tests
  ```python
  >>> negative('yolcu')
  'yolcu değil'

  ```
  '''
*/
const negative = (predicate, person = Person.THIRD, isPlural = false, delimiter = Suffix.DELIMITER) => join(predicate, delimiter, Suffix.NEGATIVE)

/*
  ### tobe
  turkish "to be" as regular/auxiliary verb (olmak).

  ✎︎ examples
  ```
  yogurt kültürdür (yogurt [is] culture)
  abbas yolcudur (abbas [is] traveller)
  evlerinin önü yoncadır (the front of their home [is] plant called yonca)
  ```

  ✎︎ tests
  ```python
  >>> tobe('yolcu')
  'yolcudur'
  >>> tobe('üzüm')
  'üzümdür'
  >>> tobe('yonca')
  'yoncadır'

  ```
*/
const tobe = (predicate, person = Person.THIRD, isPlural = false) => {
  const lastVowel = getLastVowel(predicate)
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
        predicate,
        Suffix.D,
        affix,
        Suffix.R
      )
    }
  }
}

/*
  ### personification copula

  ✎︎ examples
  ```
  ben buralıyım (i'm from here)
  sen oralısın (you're from over there)
  aynı gezegenliyiz (we're from same planet)
  ```

  ✎︎ tests
  ```python
  >>> personal('uçak', Person.FIRST, is_plural=False)
  'uçağım'

  >>> personal('oralı', Person.SECOND, is_plural=False)
  'oralısın'

  >>> personal('gezegenli', Person.FIRST, is_plural=True)
  'gezegenliyiz'

  ```
*/
const personal = (predicate, whom = Person.THIRD, isPlural = false) => impersonate(predicate, whom, isPlural, false)

/*
  ### inferential mood (-miş in turkish)
  it is used to convey information about events
  which were not directly observed or were inferred by the speaker.

  ✎︎ examples
  ```
  elmaymışım (i was an apple as i've heard)
  üzülmüşsün (you were sad as i've heard)
  doktormuş (he/she/it was a doctor as i've heard)
  üzümmüşsün (you were a grape as i've heard)
  ```

  ✎︎ tests
  ```python
  >>> inferential('öğretmen', Person.SECOND, is_plural=False)
  'öğretmenmişsin'

  >>> inferential('üzül', Person.SECOND, is_plural=False)
  'üzülmüşsün'

  >>> inferential('robot', Person.FIRST, is_plural=False)
  'robotmuşum'

  >>> inferential('robot', Person.THIRD, is_plural=False)
  'robotmuş'

  >>> inferential('ada', Person.THIRD, is_plural=False)
  'adaymış'

  ```
*/
const inferential = (predicate, whom = Person.THIRD, isPlural = false) => {
  const lastVowel = getLastVowel(predicate)
  const sound = getVowelSymbol(lastVowel)

  const inferenceSuffix = join('m', harmony(sound), 'ş')

  return skipFalsyAndJoin(
    predicate,

    // combinative consontant ⟨y⟩
    !endsWithConsonant(predicate) ? Suffix.Y : NOTHING,

    impersonate(inferenceSuffix, whom, isPlural)
  )
}

/*
  ### inferential mood (-isem in turkish)
  It is a grammatical mood used to express a proposition whose
  validity is dependent on some condition, possibly counterfactual.

  ✎︎ examples
  ```
  elmaysam (if i am an apple)
  üzümsen (if you are a grape)
  bıçaklarsa (if they are a knife)
  ```

  ✎︎ tests
  ```python
  >>> conditional('elma', Person.FIRST, is_plural=False)
  'elmaysam'
  >>> conditional('üzüm', Person.SECOND, is_plural=False)
  'üzümsen'
  >>> conditional('bıçak', Person.THIRD, is_plural=True)
  'bıçaklarsa'

  ```
*/
const conditional = (predicate, whom = Person.THIRD, isPlural = false) => {
  const conditionSuffix = isFront(predicate) ? Suffix.SE : Suffix.SA

  const map = [
    [Person.FIRST, false, Suffix.M],
    [Person.SECOND, false, Suffix.N],
    [Person.THIRD, false, NOTHING],
    [Person.FIRST, true, Suffix.K],
    [Person.SECOND, true, Suffix.NIZ],
    [Person.THIRD, true, NOTHING]
  ]

  for (let [toWhom, plurality, personification] of map) {
    if (toWhom == whom && plurality == isPlural) {
      return skipFalsyAndJoin(
        predicate,

        // plural suffix for 3rd person
        (whom == Person.THIRD && isPlural) ? (isFront(predicate) ? Suffix.LER : Suffix.LAR) : NOTHING,

        // combinative consontant ⟨y⟩
        !endsWithConsonant(predicate) ? Suffix.Y : NOTHING,

        conditionSuffix,
        personification
      )
    }
  }
}


/*
  ### alethic modality (-idi in turkish)
  linguistic modality that indicates modalities of truth,
  in particular the modalities of logical necessity,
  possibility or impossibility.

  ✎︎ examples
  ```
  elmaydım (i was an apple)
  üzümdün (you were a grape)
  doktordu (he/she/it was a doctor)
  ```

  ✎︎ tests
  ```python
  >>> perfective('açık', Person.FIRST, is_plural=False)
  'açıktım'

  >>> perfective('oralı', Person.SECOND, is_plural=False)
  'oralıydın'

  >>> perfective('dalda', Person.FIRST, is_plural=False)
  'daldaydım'

  >>> perfective('dalda', Person.THIRD, is_plural=False)
  'daldaydı'

  >>> perfective('dalda', Person.FIRST, is_plural=True)
  'daldaydık'

  >>> perfective('dalda', Person.SECOND, is_plural=True)
  'daldaydınız'

  >>> perfective('dalda', Person.THIRD, is_plural=True)
  'daldaydılar'

  >>> perfective('gezegende', Person.THIRD, is_plural=True)
  'gezegendeydiler'

  ```
*/
const perfective = (predicate, whom = Person.THIRD, isPlural = false) => impersonate(predicate, whom, isPlural, true)

/*
  ### the imperfective (-iyor in turkish)
  grammatical aspect used to describe a situation viewed with interior composition.
  describes ongoing, habitual, repeated, or similar semantic roles,
  whether that situation occurs in the past, present, or future.

  ✎︎ examples
  ```
  gidiyorum (i'm going)
  kayıyor (he's skating)
  üzümlüyor (he's graping)
  ```

  ✎︎ tests
  ```python
  >>> imperfective('açı', Person.FIRST, is_plural=False)
  'açıyorum'

  >>> imperfective('açık', Person.FIRST, is_plural=False)
  'açıkıyorum'

  >>> imperfective('oralı', Person.SECOND, is_plural=False)
  'oralıyorsun'

  >>> imperfective('dal', Person.THIRD, is_plural=False)
  'dalıyor'

  >>> imperfective('dal', Person.FIRST, is_plural=True)
  'dalıyoruz'

  >>> imperfective('dal', Person.FIRST, is_plural=True)
  'dalıyoruz'

  >>> imperfective('dal', Person.SECOND, is_plural=True)
  'dalıyorsunuz'

  >>> imperfective('dal', Person.THIRD, is_plural=True)
  'dalıyorlar'

  ```
*/
const imperfective = (predicate, whom = Person.THIRD, isPlural = false) => {
  const lastVowel = getLastVowel(predicate)
  const sound = getVowelSymbol(lastVowel)

  const imperfectCopula = skipFalsyAndJoin(
    endsWithConsonant(predicate) ? harmony(sound) : NOTHING,
    Suffix.IMPERFECT
  )

  return join(predicate, impersonate(imperfectCopula, whom, isPlural, false))
}

/*
  '''
  ### the future tense (-iyor in turkish)
  is a verb form that generally marks the event described by the verb as not
  having happened yet, but expected to happen in the future.

  ✎︎ examples
  ```
  gidecek (he'll go)
  ölecek (he'll die)
  can alacak (he'll kill someone)
  ```

  ✎︎ tests
  ```python
  >>> future('gel', Person.FIRST, is_plural=False)
  'geleceğim'

  >>> future('açık', Person.FIRST, is_plural=False)
  'açıkacağım'

  >>> future('gel', Person.FIRST, is_plural=True)
  'geleceğiz'

  ```
  '''
*/
const future = (predicate, whom = Person.THIRD, isPlural = false) => {
  const futureCopula = join(
    predicate,
    isFront(predicate) ? Suffix.FUTURE : swapFrontAndBack(Suffix.FUTURE),
  )

  return impersonate(futureCopula, whom, isPlural, false)
}

/*
  '''
  ### progressive tense

  ✎︎ examples
  gülmekteyim (i am in the process of laughing)
  ölmekteler (they are in the process of dying 👾)

  ✎︎ tests
  ```python
  >>> progressive('gel', Person.FIRST, is_plural=False)
  'gelmekteyim'

  >>> progressive('açık', Person.FIRST, is_plural=False)
  'açıkmaktayım'

  >>> progressive('gel', Person.FIRST, is_plural=True)
  'gelmekteyiz'

  ```
  '''
*/
const progressive = (predicate, whom = Person.THIRD, isPlural = false) => {
  const progressiveCopula = join(
    predicate,
    isFront(predicate) ? Suffix.PROGRESSIVE : swapFrontAndBack(Suffix.PROGRESSIVE)
  )

  return impersonate(progressiveCopula, whom, isPlural, false)
}

/*
 ### necessitative copula

  ✎︎ examples
  ```
  gitmeliyim (i must go)
  kaçmalıyım (i must run away)
  ```

  ✎︎ tests
  ```python
  >>> necessitative('git', Person.FIRST, is_plural=False)
  'gitmeliyim'

  >>> necessitative('açık', Person.FIRST, is_plural=False)
  'açıkmalıyım'

  >>> necessitative('uza', Person.FIRST, is_plural=True)
  'uzamalıyız'

  ```
*/
const necessitative = (predicate, whom = Person.THIRD, isPlural = false) => {
  const necessitativeCopula = join(
    predicate,
    isFront(predicate) ? Suffix.NECESSITY : swapFrontAndBack(Suffix.NECESSITY)
  )

  return impersonate(necessitativeCopula, whom, isPlural, false)
}

/*
  ### impotential copula

  ✎︎ examples
  ```
  gidemem (i cannot come)
  kaçamayız (we cannot run away)
  ```

  ✎︎ tests
  ```python
  >>> impotential('git', Person.FIRST, is_plural=False)
  'gidemem'

  >>> impotential('git', Person.SECOND, is_plural=False)
  'gidemezsin'

  >>> impotential('git', Person.THIRD, is_plural=False)
  'gidemez'

  >>> impotential('git', Person.FIRST, is_plural=True)
  'gidemeyiz'

  >>> impotential('git', Person.FIRST, is_plural=True)
  'gidemeyiz'

  >>> impotential('git', Person.SECOND, is_plural=True)
  'gidemezsiniz'

  >>> impotential('git', Person.THIRD, is_plural=True)
  'gidemezler'

  >>> impotential('al', Person.THIRD, is_plural=True)
  'alamazlar'

  ```
*/
const impotential = (predicate, whom = Person.THIRD, isPlural = false) => {
  let impotentialCopula = isFront(predicate) ? Suffix.IMPOTENTIAL : swapFrontAndBack(Suffix.IMPOTENTIAL)
  let plurality = isFront(predicate) ? Suffix.LER : Suffix.LAR

  const map = [
    [Person.FIRST, false, Suffix.M],
    [Person.SECOND, false, Suffix.Z + Suffix.SIN],
    [Person.THIRD, false, Suffix.Z],
    [Person.FIRST, true, Suffix.Y + Suffix.IZ],
    [Person.SECOND, true, Suffix.Z + Suffix.SIN + Suffix.IZ],
    [Person.THIRD, true, Suffix.Z + plurality]
  ]

  for (let [toWhom, plurality, personification] of map) {
    if (toWhom == whom && plurality == isPlural) {
      return skipFalsyAndJoin(
        voice(predicate),

        // combinative consontant ⟨y⟩
        !endsWithConsonant(predicate) ? Suffix.Y : NOTHING,

        impotentialCopula,
        personification
      )
    }
  }
}

const firstPersonSingular = (text, inPast = false) => {
  const lastVowel = getLastVowel(text)
  const sound = getVowelSymbol(lastVowel)

  return skipFalsyAndJoin(
    // last vowel should not be voiced in alethic modality
    inPast ? text : voice(text),

    // combinative consontant ⟨y⟩
    !endsWithConsonant(text) ? Suffix.Y : NOTHING,

    // ⟨d⟩ or ⟨t⟩
    inPast ? (endsWithVoiceless(text) ? Suffix.T : Suffix.D) : NOTHING,

    // ⟨a⟩ ⟨i⟩ ⟨u⟩ ⟨ü⟩
    harmony(sound),

    Suffix.M
  )
}

const secondPersonSingular = (text, inPast = false) => {
  const lastVowel = getLastVowel(text)
  const sound = getVowelSymbol(lastVowel)

  return skipFalsyAndJoin(
    text,

    // combinative consontant ⟨y⟩
    inPast ? !endsWithConsonant(text) ? Suffix.Y : NOTHING : NOTHING,

    // ⟨d⟩ or ⟨t⟩
    inPast ? (endsWithVoiceless(text) ? Suffix.T : Suffix.D) : NOTHING,

    // sound ⟨s⟩ in present time
    !inPast ? Suffix.S : NOTHING,

    // # ⟨a⟩ ⟨i⟩ ⟨u⟩ ⟨ü⟩
    harmony(sound),

    Suffix.N
  )
}

const thirdPersonSingular = (text, inPast = false) => {
  const lastVowel = getLastVowel(text)
  const sound = getVowelSymbol(lastVowel)

  return skipFalsyAndJoin(
    text,

    // combinative consontant ⟨y⟩
    !endsWithConsonant(text) ? Suffix.Y : NOTHING,

    // add ⟨t⟩ or ⟨d⟩ for alethic modality
    inPast ? (endsWithVoiceless(text) ? Suffix.T : Suffix.D) : NOTHING,

    // # ⟨a⟩ ⟨i⟩ ⟨u⟩ ⟨ü⟩
    inPast ? harmony(sound) : NOTHING
  )
}

const firstPersonPlural = (text, inPast = false) => {
  const lastVowel = getLastVowel(text)
  const sound = getVowelSymbol(lastVowel)

  return skipFalsyAndJoin(
    // last vowel should not be voiced in alethic modality
    inPast ? text : voice(text),

    // combinative consontant ⟨y⟩
    !endsWithConsonant(text) ? Suffix.Y : NOTHING,

    // ⟨d⟩ or ⟨t⟩
    inPast ? (endsWithVoiceless(text) ? Suffix.T : Suffix.D) : NOTHING,

    // # ⟨a⟩ ⟨i⟩ ⟨u⟩ ⟨ü⟩
    harmony(sound),

    inPast ? Suffix.K : Suffix.Z
  )
}

const secondPersonPlural = (text, inPast = false) => {
  const lastVowel = getLastVowel(text)
  const sound = getVowelSymbol(lastVowel)

  return skipFalsyAndJoin(
    secondPersonSingular(text, inPast),

    // # ⟨a⟩ ⟨i⟩ ⟨u⟩ ⟨ü⟩
    harmony(sound),

    Suffix.Z
  )
}

const thirdPersonPlural = (text, inPast = false) => skipFalsyAndJoin(
  thirdPersonSingular(text, inPast),

  // -lar or -ler, plural affix
  isFront(text) ? Suffix.LER : Suffix.LAR
)

const impersonate = (text, toWhom, isPlural, inPast = false) => {
  const map = [
    [Person.FIRST, false, firstPersonSingular],
    [Person.SECOND, false, secondPersonSingular],
    [Person.THIRD, false, thirdPersonSingular],
    [Person.FIRST, true, firstPersonPlural],
    [Person.SECOND, true, secondPersonPlural],
    [Person.THIRD, true, thirdPersonPlural]
  ]

  for (let [person, plurality, processor] of map) {
    if (person == toWhom && isPlural == plurality) {
      return processor(text, inPast)
    }
  }
}

const predicate = (text, person = Person.THIRD, copula = Copula.ZERO, isPlural = false) => {
  try {
    let processor = getCopulaProcessor(copula)
    return processor(text, person, isPlural)
  } catch (e) {
    throw new Error(`invalid copula. options: ${JSON.values(Copula).join(', ')}`)
  }
}

module.exports = {
  Person,
  zero,
  negative,
  tobe,
  personal,
  inferential,
  conditional,
  perfective,
  imperfective,
  future,
  progressive,
  necessitative,
  predicate,
  Copula,
  impotential
}
