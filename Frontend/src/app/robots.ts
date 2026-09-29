import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/auth/', '/api/'],
    },
    sitemap: 'https://techstall-computer-accessories.vercel.app/sitemap.xml',
  };
}
