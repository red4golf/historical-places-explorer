import { describe, it, expect } from 'vitest';
import { writeJson, readJson } from '../src/utils/fileUtils.js';
import fs from 'fs/promises';
import path from 'path';

describe('fileUtils', () => {
  it('writes and reads JSON', async () => {
    const tmpPath = path.join(process.cwd(), 'tmp-test.json');
    const data = { a: 1 };
    await writeJson(tmpPath, data);
    const result = await readJson(tmpPath);
    expect(result).toEqual(data);
    await fs.unlink(tmpPath);
  });
});
