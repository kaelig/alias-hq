const Path = require ('path')
const Fs = require ('fs')
const hq = require('../../src')

/**
 * Returns all plugins as a 2D hash of plugins and their options
 *
 * In this format:
 *   {
 *     jest: {},
 *     rollup: {
 *       object: { format: 'object' },
 *       array: { format: 'array' }
 *     },
 *     webpack: {}
 *   }
 * @returns {{{object}}}
 */
function getPlugins () {
  const names = hq.plugins.names
  return names.reduce(function (plugins, name) {
    const tests = require(`../../src/plugins/${name}/tests.js`)
    plugins[name] = tests.reduce(function (formats, test) {
      if (typeof test === 'function') {
        const { label = 'default', options } = test()
        formats[label] = options
        if (options) {
        }
      }
      return formats
    }, {})
    return plugins
  }, {})
}

function numAliases () {
  hq.load()
  return Object.keys(hq.config.paths).length
}

function loadJson (filename, asText = false) {
  const path = Path.resolve(filename)
  try {
    const text = Fs.readFileSync(path, 'utf8')
    return asText
      ? text
      : JSON.parse(text)
  }
  catch (err) {
    console.warn('Could not load package.json')
    return null
  }
}

function saveJson (filename, data) {
  // path
  const path = Path.resolve(filename)

  // get spacing
  const text = loadJson(true) || ''
  const match = text.match(/^(\s+)"\w/)
  const spacing = match ? match[1] : '  '

  // save new file
  try {
    const json = JSON.stringify(data, null, spacing)
    return Fs.writeFileSync(path, json, 'utf8')
  }
  catch (err) {
    console.warn('Could not save package.json', err)
    return null
  }
}

function loadSettings () {
  const data = loadJson('./package.json')
  const key = 'alias-hq'
  return data
    ? data[key] || {}
    : {}
}

function saveSettings (newSettings) {
  const data = loadJson('./package.json')
  if (data) {
    const key = 'alias-hq'
    const oldSettings = data[key] || {}
    Object.assign(oldSettings, newSettings)
    data[key] = oldSettings
    saveJson('./package.json', data)
  }
}

module.exports = {
  getPlugins,
  numAliases,
  loadSettings,
  saveSettings,
}
