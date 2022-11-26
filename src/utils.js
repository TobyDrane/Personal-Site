import { isBrowser } from './services/auth'

// Async firebase function to fetch all the blogs and return array
// consisting of blog each blog data
const firebaseFetchBlogs = async (firebase, publicOnly) => {
  // Array of download urls
  const { urls, references } = await getBlogsDownloadURLS(firebase)
  const data = await downloadFiles(urls)
  let newData = data.map((item, index) => {
    if (publicOnly && item.private) return {}
    return { ...item, reference: references[index] }
  })

  // Remove empty objects
  newData = newData.filter(n => Object.keys(n).length)
  // Finally sort by date
  const newDataSorted = newData.sort(
    (a, b) => Number(new Date(b.date)) - Number(new Date(a.date))
  )

  return newDataSorted
}

// Async function to read all blogs within firebase
// and return an array of urls to download content from
const getBlogsDownloadURLS = async firebase => {
  const storageRef = firebase.storage().ref('blogs/')
  const blogs = await storageRef.listAll()
  const { items } = blogs

  // To return an array of download urls
  const urls = []
  // Array of references -> Needed for delete functions
  const references = []
  if (items.length) {
    await Promise.all(
      items.map(async reference => {
        const url = await reference.getDownloadURL()
        urls.push(url)
        references.push(reference)
      })
    )
  }

  return { urls, references }
}

// Given an array of urls to download files from
// download file contents and return an array of objects
const downloadFiles = async urls => {
  let data = []
  if (isBrowser()) {
    const promises = urls.map(url => fetch(url).then(file => file.json()))
    data = await Promise.all(promises)
  }
  return data
}

export { firebaseFetchBlogs }
