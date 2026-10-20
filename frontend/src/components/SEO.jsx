import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'GazaBridge | Connecting Global Volunteers & Mentors with Palestine';
const DEFAULT_DESC = 'GazaBridge connects volunteers worldwide with individuals in Gaza through mentorship, digital courses, and live learning sessions.';

export default function SEO({ title, description, canonicalPath }) {
  const location = useLocation();

  useEffect(() => {
    // 1. Update Title
    const fullTitle = title ? `${title} | GazaBridge` : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Update Description
    const metaDesc = description || DEFAULT_DESC;
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.name = 'description';
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', metaDesc);

    // 3. Update Canonical URL
    const path = canonicalPath || location.pathname;
    const fullUrl = `https://gazabridge.netlify.app${path === '/' ? '' : path}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // 4. Update OpenGraph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', metaDesc);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', fullUrl);

    // 5. Update Twitter Tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', fullTitle);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', metaDesc);
  }, [title, description, canonicalPath, location.pathname]);

  return null;
}
