import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';
import pageLoader from '../src/index.js';

nock.disableNetConnect();

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('downloads page and assets', async () => {
  const url = 'https://ru.hexlet.io/courses';
  const html = `
    <html>
      <body>
        <img src="/assets/professions/nodejs.png" />
        <h3><a href="/professions/nodejs">Node.js</a></h3>
      </body>
    </html>
  `;
  const imageContent = 'image content';  
  nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, html);  
  nock('https://ru.hexlet.io')
      .get('/assets/professions/nodejs.png')
      .reply(200, imageContent);  
  const filepath = await pageLoader(url, tmpDir);  
  expect(filepath).toBe(path.join(tmpDir, 'ru-hexlet-io-courses.html'));
  const fileContent = await fs.readFile(filepath, 'utf-8');
  expect(fileContent).toContain('ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png');  
  const assetPath = path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png');
  const assetContent = await fs.readFile(assetPath, 'utf-8');
  expect(assetContent).toBe(imageContent);
});
