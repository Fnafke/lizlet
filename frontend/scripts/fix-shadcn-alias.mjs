// Workaround for a shadcn CLI bug: it sometimes writes generated files into a
// literal "./@" folder instead of resolving the "@/*" -> "./src/*" alias.
// This moves anything under "./@" into "./src" and removes the bogus folder.
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const bogusRoot = join(webRoot, '@')
const srcRoot = join(webRoot, 'src')

function moveRecursive(from, to) {
  if (!existsSync(to)) mkdirSync(to, { recursive: true })

  for (const entry of readdirSync(from)) {
    const fromPath = join(from, entry)
    const toPath = join(to, entry)

    if (statSync(fromPath).isDirectory()) {
      moveRecursive(fromPath, toPath)
    } else {
      renameSync(fromPath, toPath)
      console.log(`moved: ${fromPath.replace(webRoot, '.')} -> ${toPath.replace(webRoot, '.')}`)
    }
  }
}

if (!existsSync(bogusRoot)) {
  console.log('No "@" folder found, nothing to fix.')
  process.exit(0)
}

moveRecursive(bogusRoot, srcRoot)
rmSync(bogusRoot, { recursive: true, force: true })
console.log('Removed bogus "@" folder.')