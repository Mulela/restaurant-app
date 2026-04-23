const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=75&auto=format';

function isUnsplashUrl(url) {
  return url.hostname === 'images.unsplash.com' || url.hostname.endsWith('.unsplash.com');
}

export function getProductImageUrl(imageUrl, width = 400) {
  const source =
    typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : FALLBACK_PRODUCT_IMAGE;

  if (!source.startsWith('http://') && !source.startsWith('https://')) {
    return source;
  }

  try {
    const url = new URL(source);

    if (isUnsplashUrl(url)) {
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', '75');
      url.searchParams.set('auto', 'format');
    }

    return url.toString();
  } catch {
    return source;
  }
}
