import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ESLint } from 'eslint';
import * as prettier from 'prettier';

const write = process.argv.includes('--write');
const eslint = new ESLint({ fix: true });
const skipped = new Set(['.git', 'node_modules', 'dist']);

async function* files(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (skipped.has(entry.name)) continue;
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) yield* files(file);
        else if (entry.isFile()) yield file;
    }
}

let changed = 0;
for await (const file of files('.')) {
    const info = await prettier.getFileInfo(file, { ignorePath: '.prettierignore' });
    if (info.ignored || !info.inferredParser) continue;
    const original = await readFile(file, 'utf8');
    const options = await prettier.resolveConfig(file);
    let formatted = await prettier.format(original, { ...options, filepath: file });

    // Prettier compacts short Vue tags; apply the lab's explicit template rules last.
    if (file.endsWith('.vue')) {
        const [result] = await eslint.lintText(formatted, { filePath: file });
        formatted = result?.output ?? formatted;
    }

    if (formatted === original) continue;
    changed++;
    console.log(`${write ? 'Formatted' : 'Needs formatting:'} ${file}`);
    if (write) await writeFile(file, formatted);
}

if (changed && !write) process.exitCode = 1;
else console.log(write ? `Formatted ${changed} files.` : 'All files match the project style.');
