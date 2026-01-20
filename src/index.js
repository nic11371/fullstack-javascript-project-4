import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import * as cheerio from 'cheerio'
import debug from 'debug'
import Listr from 'listr'

const log = debug('page-loader')

const getSlug = (url) => {
  const { hostname, pathname } = new URL(url)
  return `${hostname}${pathname}`.replace(/[^a-zA-Z0-9]/g, '-')
}

const getHtmlFilename = url => `${getSlug(url)}.html`
const getDirname = url => `${getSlug(url)}_files`

const getAssetFilename = (url) => {
  const { hostname, pathname } = new URL(url)
  const { dir, name, ext } = path.posix.parse(pathname)
  const slug = `${hostname}${dir}/${name}`.replace(/[^a-zA-Z0-9]/g, '-')
  return `${slug}${ext || '.html'}`
}

const processHtml = (html, pageUrl, assetsDirName) => {
  const $ = cheerio.load(html)
  const assets = []
  const tags = [
    { name: 'img', attr: 'src' },
    { name: 'script', attr: 'src' },
    { name: 'link', attr: 'href' },
  ]

  tags.forEach(({ name, attr }) => {
    $(name).each((i, element) => {
      const url = $(element).attr(attr)
      if (!url) return

      const fullUrl = new URL(url, pageUrl)
      if (fullUrl.hostname !== new URL(pageUrl).hostname) return

      const filename = getAssetFilename(fullUrl.toString())
      const filepath = path.posix.join(assetsDirName, filename)

      assets.push({
        url: fullUrl.toString(),
        filename,
      })

      $(element).attr(attr, filepath)
    })
  })

  return { html: $.html(), assets }
}

export default (url, outputDir = process.cwd()) => {
  const htmlFilename = getHtmlFilename(url)
  const assetsDirName = getDirname(url)
  const htmlFilepath = path.join(outputDir, htmlFilename)
  const assetsDirPath = path.join(outputDir, assetsDirName)

  log(`Downloading ${url} to ${outputDir}`)

  let assets = []

  return axios.get(url)
    .catch((e) => { throw new Error(`Failed to load page: ${url}. ${e.message}`) })
    .then((response) => {
      log('Main page loaded')
      const result = processHtml(response.data, url, assetsDirName)
      assets = result.assets
      log(`Found ${assets.length} assets`)
      return result.html
    })
    .then((html) => {
      log(`Writing HTML to ${htmlFilepath}`)
      return fs.writeFile(htmlFilepath, html)
    })
    .then(() => {
      if (assets.length > 0) {
        log(`Creating assets directory ${assetsDirPath}`)
        return fs.mkdir(assetsDirPath).then(() => assets)
      }
      return []
    })
    .then((assetsList) => {
      log(`Downloading ${assetsList.length} assets`)
      const tasks = new Listr(assetsList.map(({ url, filename }) => ({
        title: url,
        task: () => axios.get(url, { responseType: 'arraybuffer' })
          .then((response) => {
            log(`Asset downloaded: ${url} -> ${filename}`)
            return fs.writeFile(path.join(assetsDirPath, filename), response.data)
          })
          .catch((e) => { throw new Error(`Failed to load resource: ${url}. ${e.message}`) }),
      })), { concurrent: true })

      return tasks.run()
    })
    .then(() => {
      log('Page loaded successfully')
      return htmlFilepath
    })
}
