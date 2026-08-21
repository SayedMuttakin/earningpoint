// Global SEO Management Module for Zenivio

export const PAGE_SEO = {
  home: {
    title: 'Zenivio – More Than a Social Network',
    h1: 'Zenivio – More Than a Social Network',
    description: 'Zenivio is more than a social network. Connect with people, share text-based posts and discover a simple social networking experience.',
    keywords: 'Zenivio, Zenivio App, Zenivio Social Network, Zenivio Social Media, Zenivio Official, Official Zenivio, Zenivio Website, Zenivio Platform, social network, social networking platform, social media platform, social networking app, social media app, online social network, digital social platform',
    canonical: 'https://zenivio.it.com/'
  },
  about: {
    title: 'About Zenivio – More Than a Social Network',
    h1: 'About Zenivio',
    description: 'Learn about Zenivio, a social networking platform built to help people connect, share text-based posts and interact in a simple digital community.',
    keywords: 'About Zenivio, Zenivio, Zenivio social network, Zenivio platform, Zenivio app',
    canonical: 'https://zenivio.it.com/?page=about'
  },
  features: {
    title: 'Zenivio Features – Social Networking & Text Posts',
    h1: 'Explore Zenivio Features',
    description: 'Explore Zenivio features designed for connecting with people, sharing text-based posts and enjoying a simple social networking experience.',
    keywords: 'Zenivio features, Zenivio social features, Zenivio posts, Zenivio social network, Zenivio social platform, social networking features, text post social network',
    canonical: 'https://zenivio.it.com/?page=features'
  },
  posts: {
    title: 'Zenivio Posts – Share and Connect',
    h1: 'Share Your Thoughts on Zenivio',
    description: 'Create and share text-based posts on Zenivio and connect with people through a simple social networking experience.',
    keywords: 'Zenivio Posts, Zenivio Post, share posts, text posts, social posts, social networking posts, share thoughts online',
    canonical: 'https://zenivio.it.com/?page=posts'
  },
  socialNetwork: {
    title: 'Zenivio Social Network – Connect and Share',
    h1: 'Zenivio Social Network',
    description: 'Connect with people and share text-based posts on Zenivio, a social networking platform built for a connected community.',
    keywords: 'Zenivio Social Network, Zenivio Social Media, social network, social networking, social networking platform, social media platform, online social network',
    canonical: 'https://zenivio.it.com/?page=social-network'
  },
  contact: {
    title: 'Contact Zenivio – Official Support',
    h1: 'Contact Zenivio',
    description: 'Contact Zenivio for questions, support, feedback and information about the platform.',
    keywords: 'Contact Zenivio, Zenivio support, Zenivio contact, Zenivio help',
    canonical: 'https://zenivio.it.com/?page=contact'
  },
  support: {
    title: 'Zenivio Help & Support',
    h1: 'Zenivio Help & Support',
    description: 'Find help and support information for Zenivio, including account, platform and user-related questions.',
    keywords: 'Zenivio Help & Support, Zenivio help, Zenivio support, Zenivio FAQ',
    canonical: 'https://zenivio.it.com/?page=support'
  }
};

export const updatePageSEO = (pageKey) => {
  if (typeof document === 'undefined') return;
  const seo = PAGE_SEO[pageKey] || PAGE_SEO.home;

  // 1. Update Title
  document.title = seo.title;

  // 2. Update Primary Meta Tags
  const updateMeta = (name, content) => {
    let el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const updateProperty = (property, content) => {
    let el = document.querySelector('meta[property="' + property + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  updateMeta('title', seo.title);
  updateMeta('description', seo.description);
  updateMeta('keywords', seo.keywords);

  // 3. Update Open Graph
  updateProperty('og:title', seo.title);
  updateProperty('og:description', seo.description);
  updateProperty('og:url', seo.canonical);

  // 4. Update Twitter Cards
  updateMeta('twitter:title', seo.title);
  updateMeta('twitter:description', seo.description);
  updateMeta('twitter:url', seo.canonical);

  // 5. Update Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) {
    canonicalEl.setAttribute('href', seo.canonical);
  }
};
