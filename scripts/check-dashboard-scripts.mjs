const base = process.env.BASE_URL || 'http://localhost:3001'
const page = `${base}/management-portal/dashboard`

const html = await (await fetch(page)).text()
const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1])

console.log('page', page)
console.log('script src count', srcs.length)
for (const s of srcs) console.log(' -', s)

for (const s of srcs) {
  const url = s.startsWith('http') ? s : base + s
  const r = await fetch(url)
  const ct = r.headers.get('content-type') || ''
  const t = await r.text()
  const head = t.slice(0, 60).replace(/\n/g, ' ')
  const bad = r.status !== 200 || !/javascript/.test(ct) || head.trim().startsWith('<')
  if (bad) {
    console.log('BAD:', s)
    console.log(' status', r.status)
    console.log(' content-type', ct)
    console.log(' head', head)
  }
}

