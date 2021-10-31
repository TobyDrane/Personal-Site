const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === 'Mdx') {
    const value = createFilePath({ node, getNode })
    // Here we create the slug url path for Mdx content
    createNodeField({
      // Individual MDX node
      node,
      // Name of the field being added
      name: 'slug',
      // Generated value based on filepath with 'blog' prefix
      value,
    })
  }
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  const query = graphql(`
    query {
      allMdx(sort: { order: DESC, fields: [frontmatter___date] }) {
        edges {
          node {
            id
            body
            excerpt(pruneLength: 250)
            fields {
              slug
            }
            frontmatter {
              title
              date
              type
              private
            }
          }
        }
      }
    }
  `)

  return query.then((results, errors) => {
    if (errors) {
      return Promise.reject(errors)
    }

    // For every page
    const blogs = results.data.allMdx.edges
    blogs.forEach(({ node }) => {
      createPage({
        path: node.fields.slug,
        component: path.resolve('./src/templates/blogs.js'),
        context: {
          slug: node.fields.slug,
        },
      })
    })
  })
}

// This should fix the issue with fetch and firebase throwing an error when Gatsby build
// see - https://github.com/gatsbyjs/gatsby/issues/29012
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /firebase/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}
