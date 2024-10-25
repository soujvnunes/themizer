import path from 'node:path';
import fs from 'node:fs';

const CSS_FILE = 'variables.css';
const BUFFER_ENCONDIG = 'utf-8';

export default function dispatchVars(rules: string) {
  const packageRootDir = process.cwd();
  const resolvedPath = path.resolve(packageRootDir, CSS_FILE);

  fs.writeFileSync(resolvedPath, rules, BUFFER_ENCONDIG);

  return fs.readFileSync(resolvedPath, BUFFER_ENCONDIG);
}
