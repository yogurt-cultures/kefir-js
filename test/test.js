import test from 'ava'

import {
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
  impotential,
  predicate
} from '../kefir/predication'

import {
  swapFrontAndBack
} from '../kefir/phonology'

import {
  sentence,
  subject,
  locative
} from '..'

test('predication > zero', t => {
  t.is(zero('yolcu'), 'yolcu')
})

test('predication > negative', t => {
  t.is(negative('yolcu'), 'yolcu değil')
})

test('predication > tobe', t => {
  t.is(tobe('yolcu'), 'yolcudur')
  t.is(tobe('üzüm'), 'üzümdür')
  t.is(tobe('yonca'), 'yoncadır')
})

test('predication > personal', t => {
  t.is(personal('uçak', Person.FIRST, false), 'uçağım')
  t.is(personal('oralı', Person.SECOND, false), 'oralısın')
  t.is(personal('gezegenli', Person.FIRST, true), 'gezegenliyiz')
})

test('predication > inferential', t => {
  t.is(inferential('öğretmen', Person.SECOND, false), 'öğretmenmişsin')
  t.is(inferential('üzül', Person.SECOND, false), 'üzülmüşsün')
  t.is(inferential('robot', Person.FIRST, false), 'robotmuşum')
  t.is(inferential('robot', Person.THIRD, false), 'robotmuş')
  t.is(inferential('ada', Person.THIRD, false), 'adaymış')
})

test('predication > conditional', t => {
  t.is(conditional('elma', Person.FIRST, false), 'elmaysam')
  t.is(conditional('üzüm', Person.SECOND, false), 'üzümsen')
  t.is(conditional('bıçak', Person.THIRD, true), 'bıçaklarsa')
})

test('predication > perfective', t => {
  t.is(perfective('açık', Person.FIRST, false), 'açıktım')
  t.is(perfective('oralı', Person.SECOND, false), 'oralıydın')
  t.is(perfective('dalda', Person.FIRST, false), 'daldaydım')
  t.is(perfective('dalda', Person.THIRD, false), 'daldaydı')
  t.is(perfective('dalda', Person.FIRST, true), 'daldaydık')
  t.is(perfective('dalda', Person.SECOND, true), 'daldaydınız')
  t.is(perfective('dalda', Person.THIRD, true), 'daldaydılar')
  t.is(perfective('gezegende', Person.THIRD, true), 'gezegendeydiler')
})

test('predication > imperfective', t => {
  t.is(imperfective('açı', Person.FIRST, false), 'açıyorum')
  t.is(imperfective('açık', Person.FIRST, false), 'açıkıyorum')
  t.is(imperfective('oralı', Person.SECOND, false), 'oralıyorsun')
  t.is(imperfective('dal', Person.THIRD, false), 'dalıyor')
  t.is(imperfective('dal', Person.FIRST, true), 'dalıyoruz')
  t.is(imperfective('dal', Person.FIRST, true), 'dalıyoruz')
  t.is(imperfective('dal', Person.SECOND, true), 'dalıyorsunuz')
  t.is(imperfective('dal', Person.THIRD, true), 'dalıyorlar')
})

test('predication > future', t => {
  t.is(future('gel', Person.FIRST, false), 'geleceğim')
  t.is(future('açık', Person.FIRST, false), 'açıkacağım')
  t.is(future('gel', Person.FIRST, true), 'geleceğiz')
})

test('predication > progressive', t => {
  t.is(progressive('gel', Person.FIRST, false), 'gelmekteyim')
  t.is(progressive('açık', Person.FIRST, false), 'açıkmaktayım')
  t.is(progressive('gel', Person.FIRST, true), 'gelmekteyiz')
})

test('predication > necessitative', t => {
  t.is(necessitative('git', Person.FIRST, false), 'gitmeliyim')
  t.is(necessitative('açık', Person.FIRST, false), 'açıkmalıyım')
  t.is(necessitative('uza', Person.FIRST, true), 'uzamalıyız')
})

test('predication > impotential', t => {
  t.is(impotential('git', Person.FIRST, false), 'gidemem')
  t.is(impotential('git', Person.SECOND, false), 'gidemezsin')
  t.is(impotential('git', Person.THIRD, false), 'gidemez')
  t.is(impotential('git', Person.FIRST, true), 'gidemeyiz')
  t.is(impotential('git', Person.FIRST, true), 'gidemeyiz')
  t.is(impotential('git', Person.SECOND, true), 'gidemezsiniz')
  t.is(impotential('git', Person.THIRD, true), 'gidemezler')
  t.is(impotential('al', Person.THIRD, true), 'alamazlar')
})

test('phonology > swapFrontAndBack', t => {
  t.is(swapFrontAndBack('acak'), 'ecek')
  t.is(swapFrontAndBack('ocok'), 'öcök')
  t.is(swapFrontAndBack('öcök'), 'ocok')
  t.is(swapFrontAndBack('acak'), 'ecek')
})

test('index module', t => {
  const ayni = subject('aynı')
  const havuc = subject('havuç')
  const gel = predicate('gel', 'third', 'perfective')
  const yap = predicate('yap', 'third', 'perfective')
  let dal = predicate('dal', 'third', 'progressive')
  dal = predicate(dal, 'third', 'perfective')

  const birisi = subject('yakup')
  t.is(sentence(birisi, yap), 'yakup yaptı')
  t.is(sentence(birisi, dal), 'yakup dalmaktaydı')

  t.is(sentence(havuc, gel), 'havuç geldi')
  t.is(sentence(havuc, yap), 'havuç yaptı')
  t.is(sentence(havuc, dal), 'havuç dalmaktaydı')

  const sebze = predicate(locative('marul'), 'first', 'perfective', true)
  dal = predicate(locative('dal'), 'first', 'perfective', true)

  t.is(sentence(ayni, sebze), 'aynı maruldaydık')
  t.is(sentence(ayni, dal), 'aynı daldaydık')
})
