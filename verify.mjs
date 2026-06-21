import ts from '/opt/node22/lib/node_modules/typescript/lib/typescript.js'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, resolve, extname } from 'node:path'

const ROOT = resolve('src')
const files = []
;(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e)
    statSync(p).isDirectory() ? walk(p) : (/\.(jsx?|tsx?)$/.test(e) && files.push(p))
  }
})(ROOT)

const EXTERNAL = new Set(['react', 'react-dom', 'react-dom/client', 'react-router-dom', '@supabase/supabase-js'])
let syntaxErrors = 0, importErrors = 0

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) {
    if (EXTERNAL.has(spec) || spec.startsWith('virtual:') || spec.startsWith('/opt/')) return true
    return EXTERNAL.has(spec)
  }
  const base = resolve(dirname(fromFile), spec)
  const cands = [base, base + '.js', base + '.jsx', base + '.ts', base + '.tsx',
                 join(base, 'index.js'), join(base, 'index.jsx')]
  // css/asset imports
  if (/\.(css|svg|png)$/.test(spec)) return existsSync(base)
  return cands.some((c) => existsSync(c))
}

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  // 1) Syntax check via TS transpile (handles JSX)
  const out = ts.transpileModule(src, {
    fileName: f,
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, allowJs: true }
  })
  const syn = (out.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error)
  for (const d of syn) {
    const { line, character } = d.file ? d.file.getLineAndCharacterOfPosition(d.start) : { line: 0, character: 0 }
    console.log(`SYNTAX  ${f}:${line + 1}:${character + 1}  ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`)
    syntaxErrors++
  }
  // 2) Local import resolution
  const re = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(src))) {
    const spec = m[1] || m[2]
    if (!resolveImport(f, spec)) { console.log(`IMPORT  ${f}  ->  cannot resolve '${spec}'`); importErrors++ }
  }
}

console.log(`\nChecked ${files.length} files.  Syntax errors: ${syntaxErrors}.  Unresolved local imports: ${importErrors}.`)
process.exit(syntaxErrors + importErrors ? 1 : 0)
