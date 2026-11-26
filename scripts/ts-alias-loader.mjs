#!/usr/bin/env node
/** Test-only Node loader for @/ aliases and extensionless local TypeScript imports. */
import { existsSync } from 'node:fs'
import { dirname, extname, resolve as resolvePath } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = process.cwd()

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    let file = resolvePath(projectRoot, specifier.slice(2))
    if (!extname(file)) file += '.ts'
    if (existsSync(file)) return { url: pathToFileURL(file).href, shortCircuit: true }
  }

  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
    const parentPath = fileURLToPath(context.parentURL)
    let file = resolvePath(dirname(parentPath), specifier)
    if (!extname(file) && existsSync(`${file}.ts`)) file += '.ts'
    if (existsSync(file)) return { url: pathToFileURL(file).href, shortCircuit: true }
  }

  return nextResolve(specifier, context)
}
