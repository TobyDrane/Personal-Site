const fs = require('fs')
const { spawn } = require('child_process')
const { exitCode } = require('process')

const notebooksFolder = './blogs'
const outputFolder = './blogs-built/'

fs.readdir(notebooksFolder, (error, files) => {
  if (error) {
    return exitCode(1)
  }

  files.forEach(file => {
    if (file.split('.')[1] === 'ipynb') {
      console.log(`Converting Blog File ${file}`)
      const convert = spawn('jupyter', [
        'nbconvert',
        '--output-dir',
        outputFolder,
        '--to',
        'html',
        `${notebooksFolder}/${file}`,
        '--template',
        `${notebooksFolder}/template/`,
        '--TagRemovePreprocessor.remove_cell_tags',
        '{"metadata"}',
      ])
    }
  })
})
