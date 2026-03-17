const base = process.env.BASE_URL || 'http://localhost:3001'
const page = `${base}/`

const html = await (await fetch(page)).text()
const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1])

console.log('page', page)
console.log('script src count', srcs.length)
for (const s of srcs) console.log(' -', s)

const legacy = srcs.filter((s) => s.includes('main-app.js') || s.includes('app-pages-internals.js'))
console.log('legacy', legacy)

