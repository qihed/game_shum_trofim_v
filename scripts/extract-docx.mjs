import fs from 'fs'

const xml = fs.readFileSync('c:/dev/game_shum/_docx_extract/word/document.xml', 'utf8')
const parts = xml.split(/<w:p[\s>]/)
const paras = []
for (const p of parts) {
  const texts = [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((x) => x[1])
  if (texts.length) paras.push(texts.join(''))
}
fs.writeFileSync('c:/dev/game_shum/_docx_text.txt', paras.join('\n'), 'utf8')
console.log('paras', paras.length)
