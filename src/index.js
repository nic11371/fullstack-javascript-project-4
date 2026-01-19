import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

const getSlug = (url) => {
  const { hostname, pathname } = new URL(url);
  return `${hostname}${pathname}`.replace(/[^a-zA-Z0-9]/g, '-');
};

const getHtmlFilename = (url) => `${getSlug(url)}.html`;
const getDirname = (url) => `${getSlug(url)}_files`;

const getAssetFilename = (url) => {
  const { hostname, pathname } = new URL(url);
  const { dir, name, ext } = path.posix.parse(pathname);
  const slug = `${hostname}${dir}/${name}`.replace(/[^a-zA-Z0-9]/g, '-');
  return `${slug}${ext}`;
};

const processHtml = (html, pageUrl, assetsDirName) => {
  const $ = cheerio.load(html);
  const assets = [];

  $('img').each((i, element) => {
    const src = $(element).attr('src');
    if (!src) return;

    const fullUrl = new URL(src, pageUrl);
    if (fullUrl.hostname !== new URL(pageUrl).hostname) return;

    const filename = getAssetFilename(fullUrl.toString());
    const filepath = path.posix.join(assetsDirName, filename);

    assets.push({
      url: fullUrl.toString(),
      filename,
    });

    $(element).attr('src', filepath);
  });

  return { html: $.html(), assets };
};

export default (url, outputDir = process.cwd()) => {
  const htmlFilename = getHtmlFilename(url);
  const assetsDirName = getDirname(url);
  const htmlFilepath = path.join(outputDir, htmlFilename);
  const assetsDirPath = path.join(outputDir, assetsDirName);

  let assets = [];

  return axios.get(url)
    .then((response) => {
      const result = processHtml(response.data, url, assetsDirName);
      assets = result.assets;
      return result.html;
    })
    .then((html) => fs.writeFile(htmlFilepath, html))
    .then(() => {
      if (assets.length > 0) {
        return fs.mkdir(assetsDirPath).then(() => assets);
      }
      return [];
    })
    .then((assetsList) => {
      const tasks = assetsList.map(({ url, filename }) => axios.get(url, { responseType: 'arraybuffer' })
        .then((response) => fs.writeFile(path.join(assetsDirPath, filename), response.data)));
      return Promise.all(tasks);
    })
    .then(() => htmlFilepath);
};