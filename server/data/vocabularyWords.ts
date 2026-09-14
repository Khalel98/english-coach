import type { CefrLevel } from './placementQuestions'

export interface VocabularyWordSeed {
  word: string
  cefrLevel: CefrLevel
  translationRu: string
  exampleSentence: string
}

export const VOCABULARY_WORDS: VocabularyWordSeed[] = [
  // A1
  { word: 'house', cefrLevel: 'A1', translationRu: 'дом', exampleSentence: 'This is my house near the park.' },
  { word: 'family', cefrLevel: 'A1', translationRu: 'семья', exampleSentence: 'I love spending time with my family.' },
  { word: 'water', cefrLevel: 'A1', translationRu: 'вода', exampleSentence: 'Can I have a glass of water, please?' },
  { word: 'food', cefrLevel: 'A1', translationRu: 'еда', exampleSentence: 'The food at this restaurant is delicious.' },
  { word: 'friend', cefrLevel: 'A1', translationRu: 'друг', exampleSentence: 'She is my best friend from school.' },
  { word: 'school', cefrLevel: 'A1', translationRu: 'школа', exampleSentence: 'My children go to school every day.' },
  { word: 'book', cefrLevel: 'A1', translationRu: 'книга', exampleSentence: 'I am reading an interesting book.' },
  { word: 'happy', cefrLevel: 'A1', translationRu: 'счастливый', exampleSentence: 'We were happy to see you again.' },
  { word: 'big', cefrLevel: 'A1', translationRu: 'большой', exampleSentence: 'They live in a big house in the countryside.' },
  { word: 'red', cefrLevel: 'A1', translationRu: 'красный', exampleSentence: 'She was wearing a red dress.' },

  // A2
  { word: 'weather', cefrLevel: 'A2', translationRu: 'погода', exampleSentence: "The weather is nice today, let's go for a walk." },
  { word: 'weekend', cefrLevel: 'A2', translationRu: 'выходные', exampleSentence: 'What are your plans for the weekend?' },
  { word: 'journey', cefrLevel: 'A2', translationRu: 'путешествие, поездка', exampleSentence: 'The journey to the mountains took five hours.' },
  { word: 'exercise', cefrLevel: 'A2', translationRu: 'упражнение, физическая нагрузка', exampleSentence: 'I try to exercise every morning before work.' },
  { word: 'borrow', cefrLevel: 'A2', translationRu: 'одолжить, взять взаймы', exampleSentence: 'Can I borrow your pen for a minute?' },
  { word: 'neighbor', cefrLevel: 'A2', translationRu: 'сосед', exampleSentence: 'Our neighbor is very friendly and helpful.' },
  { word: 'comfortable', cefrLevel: 'A2', translationRu: 'удобный', exampleSentence: 'This chair is very comfortable to sit in.' },
  { word: 'expensive', cefrLevel: 'A2', translationRu: 'дорогой', exampleSentence: 'That restaurant is too expensive for us.' },
  { word: 'decide', cefrLevel: 'A2', translationRu: 'решить', exampleSentence: 'We need to decide where to go for dinner.' },
  { word: 'remember', cefrLevel: 'A2', translationRu: 'помнить, вспомнить', exampleSentence: "I can't remember where I put my keys." },

  // B1
  { word: 'achieve', cefrLevel: 'B1', translationRu: 'достичь', exampleSentence: 'She worked hard to achieve her goals.' },
  { word: 'environment', cefrLevel: 'B1', translationRu: 'окружающая среда', exampleSentence: 'We should protect the environment for future generations.' },
  { word: 'opportunity', cefrLevel: 'B1', translationRu: 'возможность', exampleSentence: 'This job is a great opportunity for me.' },
  { word: 'responsibility', cefrLevel: 'B1', translationRu: 'ответственность', exampleSentence: 'Taking care of the project is my responsibility.' },
  { word: 'reliable', cefrLevel: 'B1', translationRu: 'надёжный', exampleSentence: 'He is a reliable colleague who always finishes on time.' },
  { word: 'convenient', cefrLevel: 'B1', translationRu: 'удобный (по обстоятельствам)', exampleSentence: 'Is it convenient for you to meet tomorrow?' },
  { word: 'appropriate', cefrLevel: 'B1', translationRu: 'уместный, подходящий', exampleSentence: "That joke wasn't appropriate for the meeting." },
  { word: 'aware', cefrLevel: 'B1', translationRu: 'осведомлённый', exampleSentence: 'Are you aware of the new company policy?' },
  { word: 'confident', cefrLevel: 'B1', translationRu: 'уверенный', exampleSentence: 'She felt confident before the interview.' },
  { word: 'particular', cefrLevel: 'B1', translationRu: 'особенный, конкретный', exampleSentence: "Is there a particular reason you're asking?" },

  // B2
  { word: 'consequence', cefrLevel: 'B2', translationRu: 'последствие', exampleSentence: 'Every action has a consequence.' },
  { word: 'sufficient', cefrLevel: 'B2', translationRu: 'достаточный', exampleSentence: "We don't have sufficient evidence to make a decision." },
  { word: 'inevitable', cefrLevel: 'B2', translationRu: 'неизбежный', exampleSentence: 'Change in the industry was inevitable.' },
  { word: 'controversial', cefrLevel: 'B2', translationRu: 'спорный', exampleSentence: "It's a controversial topic that divides opinions." },
  { word: 'undermine', cefrLevel: 'B2', translationRu: 'подрывать', exampleSentence: 'His comments undermined her confidence.' },
  { word: 'perspective', cefrLevel: 'B2', translationRu: 'точка зрения', exampleSentence: 'Try to see it from my perspective.' },
  { word: 'ambiguous', cefrLevel: 'B2', translationRu: 'неоднозначный', exampleSentence: 'The instructions were ambiguous and confused everyone.' },
  { word: 'thorough', cefrLevel: 'B2', translationRu: 'тщательный', exampleSentence: 'She did a thorough review of the report.' },
  { word: 'coincidence', cefrLevel: 'B2', translationRu: 'совпадение', exampleSentence: 'Meeting you here is quite a coincidence.' },
  { word: 'relevant', cefrLevel: 'B2', translationRu: 'актуальный, относящийся к делу', exampleSentence: 'Please only share information relevant to the case.' },

  // C1
  { word: 'meticulous', cefrLevel: 'C1', translationRu: 'дотошный, скрупулёзный', exampleSentence: 'He is meticulous about checking every detail.' },
  { word: 'ubiquitous', cefrLevel: 'C1', translationRu: 'вездесущий', exampleSentence: 'Smartphones have become ubiquitous in modern life.' },
  { word: 'discern', cefrLevel: 'C1', translationRu: 'различать, распознавать', exampleSentence: 'It was hard to discern his true intentions.' },
  { word: 'pragmatic', cefrLevel: 'C1', translationRu: 'прагматичный', exampleSentence: 'We need a pragmatic solution, not an ideal one.' },
  { word: 'resilient', cefrLevel: 'C1', translationRu: 'стойкий, устойчивый', exampleSentence: 'The economy proved resilient despite the crisis.' },
  { word: 'nuance', cefrLevel: 'C1', translationRu: 'нюанс', exampleSentence: 'The translation lost some of the original nuance.' },
  { word: 'plausible', cefrLevel: 'C1', translationRu: 'правдоподобный', exampleSentence: 'Her explanation sounded plausible.' },
  { word: 'inherent', cefrLevel: 'C1', translationRu: 'присущий, врождённый', exampleSentence: 'There are inherent risks in any investment.' },
  { word: 'articulate', cefrLevel: 'C1', translationRu: 'умеющий чётко выражать мысли', exampleSentence: 'He is an articulate speaker who explains complex ideas clearly.' },
  { word: 'coherent', cefrLevel: 'C1', translationRu: 'связный, логичный', exampleSentence: 'Her argument was coherent and well-structured.' },

  // C2
  { word: 'ephemeral', cefrLevel: 'C2', translationRu: 'мимолётный', exampleSentence: 'Fame on social media can be ephemeral.' },
  { word: 'esoteric', cefrLevel: 'C2', translationRu: 'эзотерический, малопонятный узкому кругу', exampleSentence: 'The lecture covered rather esoteric aspects of the theory.' },
  { word: 'vindicate', cefrLevel: 'C2', translationRu: 'оправдать, подтвердить правоту', exampleSentence: 'The results ultimately vindicated her original theory.' },
  { word: 'ostensible', cefrLevel: 'C2', translationRu: 'мнимый, показной', exampleSentence: 'The ostensible reason for the meeting was budget planning.' },
  { word: 'cogent', cefrLevel: 'C2', translationRu: 'убедительный', exampleSentence: 'He presented a cogent argument for the change.' },
  { word: 'ineffable', cefrLevel: 'C2', translationRu: 'невыразимый словами', exampleSentence: 'There was an ineffable sense of joy in the room.' },
  { word: 'perfunctory', cefrLevel: 'C2', translationRu: 'формальный, сделанный для галочки', exampleSentence: 'He gave a perfunctory nod and left.' },
  { word: 'sagacious', cefrLevel: 'C2', translationRu: 'проницательный, мудрый', exampleSentence: 'Her sagacious advice saved the company from a costly mistake.' },
  { word: 'obfuscate', cefrLevel: 'C2', translationRu: 'затемнять смысл, запутывать', exampleSentence: 'The report seemed designed to obfuscate the real numbers.' },
  { word: 'quintessential', cefrLevel: 'C2', translationRu: 'типичнейший, образцовый', exampleSentence: 'This dish is the quintessential example of local cuisine.' },
]
