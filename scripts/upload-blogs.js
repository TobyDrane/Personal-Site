require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { initializeApp } = require('firebase-admin/app')
const { credential } = require('firebase-admin')
const { getStorage } = require('firebase-admin/storage')
const { exit } = require('process')

const blogsBuiltFolder = './blogs-built/'
const blogsFolder = './blogs'

initializeApp({
  credential: credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
})

const blogs = []

// Load all blog files
const files = fs.readdirSync(blogsFolder)
// Read through every file within the directory
files.forEach(file => {
  const filePath = path.join(blogsFolder, file)
  const stat = fs.statSync(filePath)

  // Only load if it is a .ipynb file
  if (stat.isFile() && file.split('.').pop() === 'ipynb') {
    const data = fs.readFileSync(filePath)

    // First we load the metadata using the cell tags
    const blog = JSON.parse(data)
    const cells = blog.cells
    // We always assume the top cell contains the metadata
    const metadataCell = cells[0]

    try {
      const _metadata = {}
      if (metadataCell.metadata.tags.includes('metadata')) {
        const metadata = metadataCell.source

        metadata.forEach(metadataLine => {
          const type = metadataLine.split(':')[0]
          let value = metadataLine.split(':')[1].trim()

          if (type === 'tags') {
            value = value.split(',')
          }

          if (type === 'date') {
            console.log(value)
            value = new Date(value)
          }

          _metadata[type] = value
        })

        _metadata['file'] = `${file.split('.')[0]}.html`
      }

      // Now create the word count
      let wordCount = 0
      cells.forEach(cell => {
        if (cell['cell_type'] === 'markdown' && cell !== metadataCell) {
          const content = cell['source']
          content.forEach(line => {
            const words = line.split(' ').filter(a => a !== '#' || a !== '\n')
            wordCount += words.length
          })
        }
      })

      _metadata['wordCount'] = wordCount
      blogs.push(_metadata)
    } catch (e) {
      console.error(e)
      console.error(`Blog ${file} does not contain any metadata`)
      return exit(1)
    }
  }
})

getStorage()
  .bucket()
  .file('blogs-html/metadata.json')
  .save(JSON.stringify(blogs))

fs.readdir(blogsBuiltFolder, (error, files) => {
  if (error) {
    return exit(1)
  }

  files.forEach(file => {
    getStorage()
      .bucket()
      .upload(`${blogsBuiltFolder}/${file}`, {
        destination: `blogs-html/${file}`,
        contentType: 'text/html',
        public: true,
      })
      .then(response => {
        console.log(`Uploaded File ${file}`)
      })
      .catch(error => {
        console.error(error)
      })
  })
})
