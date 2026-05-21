import fs from 'node:fs'
import path from 'node:path'
import { PDFParse } from 'pdf-parse'

/**
 * Usage:
 *   node scripts/extractStoryFromPdf.mjs "D:\path\Сценарий.pdf" "src/game/story.json"
 */

const [pdfPath, outPath = 'src/game/story.json'] = process.argv.slice(2)
if (!pdfPath) {
  console.error('Missing PDF path.\nExample: node scripts/extractStoryFromPdf.mjs "D:\\\\Загрузки браузера\\\\Сценарий.pdf"')
  process.exit(1)
}

const normalize = (s) =>
  s
    .replace(/\r/g, '')
    .replace(/\n--\s*\d+\s+of\s+\d+\s*--\n/g, '\n')
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/—/g, '-')
    .trim()

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const stats = [
  'talent',
  'craft',
  'watching',
  'teamTrust',
  'audienceContact',
  'projectViability',
  'staminaEnergy',
]

const guessDelta = (choiceText) => {
  const t = choiceText.toLowerCase()
  /** @type {Record<string, number>} */
  const delta = Object.fromEntries(stats.map((k) => [k, 0]))

  // Heuristic: map intent keywords -> +1/-1. Keeps data usable and editable.
  const add = (key, v) => {
    delta[key] = clamp((delta[key] ?? 0) + v, -3, 3)
  }

  if (t.includes('талант') || t.includes('интуиц')) add('talent', 1)
  if (t.includes('ремесл') || t.includes('ограничен') || t.includes('план') || t.includes('таблиц'))
    add('craft', 1)
  if (t.includes('референс') || t.includes('насмотр')) add('watching', 1)
  if (t.includes('команд') || t.includes('делег') || t.includes('бриф')) add('teamTrust', 1)
  if (t.includes('зрител') || t.includes('показ') || t.includes('обсужден')) add('audienceContact', 1)
  if (t.includes('смет') || t.includes('срок') || t.includes('производств') || t.includes('риски'))
    add('projectViability', 1)
  if (t.includes('дисципл') || t.includes('режим') || t.includes('вынослив') || t.includes('устал'))
    add('staminaEnergy', 1)

  if (t.includes('притвор') || t.includes('завыс') || t.includes('назло') || t.includes('упрям'))
    add('teamTrust', -1)
  if (t.includes('сор') || t.includes('спор') || t.includes('обвин')) add('staminaEnergy', -1)
  if (t.includes('бросить') && t.includes('вуз')) add('projectViability', -1)

  return delta
}

const parseChoices = (blockBody) => {
  const choiceRe = /(?:^|\n)Выбор\s+([A-ZА-Я])\.\s*([^\n]+)\n([\s\S]*?)(?=(?:\nВыбор\s+[A-ZА-Я]\.)|\nБлок\s+\d+\.|\nФинальная развилка|$)/g
  /** @type {Array<any>} */
  const choices = []
  let m
  while ((m = choiceRe.exec(blockBody))) {
    const id = m[1]
    const label = normalize(m[2])
    const rest = normalize(m[3])

    const consequence = normalize((rest.split(/Последствие:\s*/i)[1] ?? '').split(/Анализ выбора:\s*/i)[0] ?? '')
    const analysis = normalize((rest.split(/Анализ выбора:\s*/i)[1] ?? '').split(/Вопрос на размышление:\s*/i)[0] ?? '')
    const reflectionQuestion = normalize((rest.split(/Вопрос на размышление:\s*/i)[1] ?? '').split(/\n/)[0] ?? '')

    const textBeforeConsequence = normalize(rest.split(/Последствие:\s*/i)[0] ?? '')

    choices.push({
      id,
      label,
      text: textBeforeConsequence,
      consequence: consequence || '',
      analysis: analysis || '',
      reflectionQuestion: reflectionQuestion || '',
      deltaStats: guessDelta(`${label}\n${textBeforeConsequence}\n${analysis}`),
    })
  }
  return choices
}

const parseBlocks = (fullText) => {
  const blocks = []
  const blockRe = /(?:^|\n)Блок\s+(\d+)\.\s*([^\n]+)\n([\s\S]*?)(?=(?:\nБлок\s+\d+\.|\nФинальная развилка|$))/g
  let m
  while ((m = blockRe.exec(fullText))) {
    const id = Number(m[1])
    const title = normalize(m[2])
    const body = normalize(m[3])

    const question = normalize((body.split(/Вопрос:\s*/i)[1] ?? '').split(/\nСитуация:\s*/i)[0] ?? '')
    const situation = normalize((body.split(/Ситуация:\s*/i)[1] ?? '').split(/\nВыбор\s+/i)[0] ?? '')
    const choices = parseChoices(body)

    blocks.push({
      id,
      title,
      question,
      situation,
      choices,
    })
  }
  return blocks
}

const parseFinal = (fullText) => {
  const startIdx = fullText.indexOf('Финальная развилка')
  if (startIdx < 0) return null
  const finalBody = normalize(fullText.slice(startIdx))
  // The PDF uses "Выбор A/B/C/D." in the final section.
  const choices = parseChoices(finalBody)
  const situation = normalize((finalBody.split(/Ситуация:\s*/i)[1] ?? '').split(/\nВыбор\s+/i)[0] ?? '')
  return {
    id: 'final',
    title: 'Финальная развилка',
    question: '',
    situation,
    choices,
  }
}

const pdfBuf = fs.readFileSync(pdfPath)
const parser = new PDFParse({ data: pdfBuf })
const textResult = await parser.getText()
await parser.destroy()
const fullText = normalize(textResult.text ?? '')

const story = {
  meta: {
    title: 'Не финальный дубль',
    subtitle: 'Большой сценарий игры с развилками',
    sourcePdf: path.basename(pdfPath),
    stats,
  },
  welcome: {
    headline: 'Добро пожаловать на студию',
    body: 'Перед вами ролевая игра с развилками в формате истории с выбором. В ключевых точках вы делаете выбор и видите последствия, анализ и вопрос на размышление.',
  },
  heroProfile: {
    name: 'Максим',
    age: 21,
    dream:
      'Хочет снимать поистине классное кино, которое находит отклик у множества зрителей и несет глубокий ценностный смысл.',
    education: 'Неоконченное высшее юридическое образование',
    experience: 'Небольшие студенческие проекты, короткометражные фильмы',
    family: 'Не женат; родители негативно относятся к кинематографу как месту работы',
    allies:
      'Пока не сформировал большой профессиональный круг; есть маленькая рабочая команда, другие друзья не поддерживают выбор',
    socialCapital: 'Ниже среднего',
    financialCapital: 'Как у среднестатистических студентов',
    character:
      'Амбициозный, но ощущает кризис и разочарование в выборе образования и невозможности реализовать мечту',
    topGoal: 'Попасть в крутой продакшн / получить крупный проект с хорошим финансированием',
  },
  initialStats: Object.fromEntries(stats.map((k) => [k, 5])),
  blocks: parseBlocks(fullText),
  final: parseFinal(fullText),
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(story, null, 2), 'utf8')
console.log(`Wrote ${outPath} with ${story.blocks.length} blocks${story.final ? ' + final' : ''}.`)
