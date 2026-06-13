import sharp from 'sharp'
import { readdirSync } from 'fs'
import { join } from 'path'

const dir = 'src/assets/icons'
const files = readdirSync(dir).filter(f => f.endsWith('.svg'))

for (const f of files) {
  const out = f.replace('.svg', '.png')
  await sharp(join(dir, f), { density: 300 })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(dir, out))
  console.log('✓', out)
}