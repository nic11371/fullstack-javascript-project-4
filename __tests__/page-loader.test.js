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
    <!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="utf-8">
        <title>Курсы по программированию Хекслет</title>
        <link rel="stylesheet" media="all" href="https://cdn2.hexlet.io/assets/menu.css">
        <link rel="stylesheet" media="all" href="/assets/application.css" />
        <link href="/courses" rel="canonical">
      </head>
      <body>
        <img src="/assets/professions/nodejs.png" alt="Иконка профессии Node.js-программист" />
        <h3>
          <a href="/professions/nodejs">Node.js-программист</a>
        </h3>
        <script src="https://js.stripe.com/v3/"></script>
        <script src="https://ru.hexlet.io/packs/js/runtime.js"></script>
      </body>
    </html>
  `;
  const imageContent = 'image content';
  const cssContent = 'css content';
  const jsContent = 'js content';

  nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, html);

  nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, html);

  nock('https://ru.hexlet.io')
      .get('/assets/professions/nodejs.png')
      .reply(200, imageContent);

  nock('https://ru.hexlet.io')
      .get('/assets/application.css')
      .reply(200, cssContent);

  nock('https://ru.hexlet.io')
      .get('/packs/js/runtime.js')
      .reply(200, jsContent);

  const filepath = await pageLoader(url, tmpDir);

  expect(filepath).toBe(path.join(tmpDir, 'ru-hexlet-io-courses.html'));
  const fileContent = await fs.readFile(filepath, 'utf-8');
  expect(fileContent).toContain('ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png');
  expect(fileContent).toContain('ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css');
  expect(fileContent).toContain('ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js');
  expect(fileContent).toContain('ru-hexlet-io-courses_files/ru-hexlet-io-courses.html');
  expect(fileContent).toContain('https://cdn2.hexlet.io/assets/menu.css');

  expect(await fs.readFile(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png'), 'utf-8')).toBe(imageContent);
  expect(await fs.readFile(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-application.css'), 'utf-8')).toBe(cssContent);
  expect(await fs.readFile(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-packs-js-runtime.js'), 'utf-8')).toBe(jsContent);
  expect(await fs.readFile(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-courses.html'), 'utf-8')).toBe(html);
});
