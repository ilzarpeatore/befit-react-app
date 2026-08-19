#!/usr/bin/env node
// Extracts a react-navigation route map + Navigation.tsx binding manifest that
// vendor/parse-routes.mjs (from https://github.com/aleqsio/expo-map) can read.
//
// App.tsx registers ~130 screens directly (React.lazy() + <Screen name=.. component={..}/>)
// instead of the routes.ts/Navigation.tsx convention the upstream parser expects, so this
// script derives that manifest from App.tsx and writes it to the project root. It's meant
// to be deleted again right after parse-routes.mjs runs — see generate-map.sh.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const src = fs.readFileSync(path.join(projectRoot, 'App.tsx'), 'utf8')

const ALIASES = {
  '@components/': './components/',
  '@pages/': './pages/',
  '@assets/': './assets/',
  '@constants/': './constants/',
  '@helper/': './helper/',
  '@store/': './store/',
  '@api/': './api/',
  '@hooks/': './hooks/',
  '@/': './',
}

function resolveAlias(spec) {
  for (const [alias, rel] of Object.entries(ALIASES)) {
    if (spec.startsWith(alias)) return rel + spec.slice(alias.length)
  }
  return spec
}

const lazyRe = /const\s+([A-Za-z0-9_]+)\s*=\s*React\.lazy\(\s*\(\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)\s*\)/g
const lazyMap = {}
for (const m of src.matchAll(lazyRe)) lazyMap[m[1]] = resolveAlias(m[2])

const screenRe = /name="([A-Za-z0-9_]+)"[\s\S]{0,200}?(?:getComponent=\{\(\)\s*=>\s*([A-Za-z0-9_]+)\}|component=\{([A-Za-z0-9_]+)(?:\s+as\s+any)?\})/g
const seenNames = new Set()
const screens = []
for (const m of src.matchAll(screenRe)) {
  const name = m[1]
  const comp = m[2] ?? m[3]
  if (seenNames.has(name)) continue
  if (!lazyMap[comp]) continue // nested navigator container (e.g. Homenavigator), not a leaf screen
  seenNames.add(name)
  screens.push({ name, comp, spec: lazyMap[comp] })
}

function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

const routesLines = ['export const routes = {']
for (const s of screens) routesLines.push(`  ${s.name}: '/${kebab(s.name)}',`)
routesLines.push('}')
fs.writeFileSync(path.join(projectRoot, 'routes.ts'), routesLines.join('\n') + '\n')

const navLines = []
for (const s of screens) navLines.push(`import ${s.comp} from '${s.spec}';`)
navLines.push('')
navLines.push('// Auto-generated static-analysis manifest for expo-map. Not executed at runtime — deleted right after generate-map.sh runs the parser.')
for (const s of screens) navLines.push(`<Screen name="${s.name}" component={${s.comp}} />`)
fs.writeFileSync(path.join(projectRoot, 'Navigation.tsx'), navLines.join('\n') + '\n')

console.log(`wrote routes.ts and Navigation.tsx with ${screens.length} screens`)
