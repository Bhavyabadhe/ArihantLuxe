import { Product } from '../components/ProductCard';
import { products as seedProducts, getProductSlug } from '../data/products';

const CACHE_KEY = 'arihant_products_cache_v3';
const CACHE_TIMESTAMP_KEY = 'arihant_products_cache_timestamp_v3';

// In-memory runtime cache for lightning-fast 0ms tab switching
let memoryCatalog: Product[] | null = null;

// Convert static seed products to the standard Product interface
function getSeedProducts(): Product[] {
  return seedProducts.map((p) => ({
    id: p.id,
    slug: getProductSlug(p),
    name: p.name,
    price: p.price,
    category: p.category || 'Clothing',
    description: p.description,
    image: Array.isArray(p.image) ? p.image[0] : p.image,
    images: Array.isArray(p.image) ? p.image : [p.image],
    badge: p.badge,
    stock: 15,
    size: p.size,
    color: p.color,
  }));
}

/**
 * Returns cached products synchronously for 0ms initial page render.
 * Priority: 1. In-memory, 2. localStorage, 3. Seed catalog
 */
export function getInitialProducts(): Product[] {
  if (memoryCatalog && memoryCatalog.length > 0) {
    return memoryCatalog;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCatalog = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached products:', e);
    }
  }

  const fallback = getSeedProducts();
  memoryCatalog = fallback;
  return fallback;
}

/**
 * Save fresh products from the database into memory and localStorage cache
 */
export function setCachedProducts(products: Product[]): void {
  if (!Array.isArray(products) || products.length === 0) return;
  memoryCatalog = products;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(products));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
    } catch (e) {
      console.warn('Failed to save products cache:', e);
    }
  }
}

/**
 * Get single product by slug or id from cache
 */
export function getCachedProductBySlugOrId(slugOrId: string | undefined): Product | null {
  if (!slugOrId) return null;
  const list = getInitialProducts();
  const clean = decodeURIComponent(slugOrId).toLowerCase().trim();

  // 1. Try slug match
  const bySlug = list.find((p) => p.slug && p.slug.toLowerCase() === clean);
  if (bySlug) return bySlug;

  // 2. Try ID match
  const byId = list.find((p) => String(p.id) === clean);
  if (byId) return byId;

  // 3. Normalized name slug match
  const byName = list.find(
    (p) =>
      p.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') === clean
  );
  if (byName) return byName;

  return null;
}

/**
 * Fetch fresh products from API with automatic timeout, SWR updating, and error resilience
 */
export async function fetchProductsSWR(
  onUpdate?: (products: Product[]) => void
): Promise<Product[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second safety timeout

  try {
    const res = await fetch('/api/products', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCachedProducts(data);
        if (onUpdate) onUpdate(data);
        return data;
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn('Products fetch timed out after 8s, using cached products.');
    } else {
      console.warn('Products background sync notice:', err.message);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  return getInitialProducts();
}
