module.exports = {
  siteMetadata: {
    title: 'Meta Grabber',
    author: 'Andreas Willi',
    description:
      'A tool to grab metadata for tv shows and rename files on your hard disk.',
  },
  pathPrefix: '/meta-grabber',
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/assets/images/favicon.png', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-sass',
    'gatsby-plugin-offline',
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-131297671-2',
        // Puts tracking script in the head instead of the body
        head: true,
      },
    },
  ],
}
