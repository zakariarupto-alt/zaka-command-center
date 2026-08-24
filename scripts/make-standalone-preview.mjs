import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const htmlPath = path.join(dist, 'index.html')
let html = fs.readFileSync(htmlPath, 'utf8')

const cssMatch = html.match(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/i)
if (cssMatch) {
  const cssFile = path.join(dist, cssMatch[1].replace(/^\//, ''))
  const css = fs.readFileSync(cssFile, 'utf8')
  html = html.replace(cssMatch[0], () => `<style>\n${css}\n</style>`)
}

const scriptMatch = html.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["'][^>]*><\/script>/i)
if (scriptMatch) {
  const jsFile = path.join(dist, scriptMatch[1].replace(/^\//, ''))
  const js = fs.readFileSync(jsFile, 'utf8')
  html = html.replace(scriptMatch[0], () => `<script type="module">\n${js}\n</script>`)
}

const iconMatch = html.match(/<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["'][^>]*>/i)
if (iconMatch) {
  const iconFile = path.join(dist, iconMatch[1].replace(/^\//, ''))
  if (fs.existsSync(iconFile)) {
    const svg = fs.readFileSync(iconFile, 'utf8')
    const data = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
    html = html.replace(iconMatch[0], () => iconMatch[0].replace(iconMatch[1], data))
  }
}

html = html.replace(/<link[^>]+rel=["']modulepreload["'][^>]*>/gi, '')

if (/\/assets\//.test(html)) {
  throw new Error('Standalone preview still contains unresolved /assets/ references')
}
if (/href=["']\/favicon\.svg["']/.test(html)) {
  throw new Error('Standalone preview still contains unresolved favicon reference')
}

fs.writeFileSync(path.join(dist, 'memory-space-preview.html'), html)
console.log('Standalone preview created: dist/memory-space-preview.html')
