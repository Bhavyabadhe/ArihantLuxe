export interface ProductReview {
  id: string;
  name: string;
  rating: number; // 1-5
  title?: string;
  size: string;
  body: string;
  color: string;
  createdAt: number; // epoch ms
}

export interface Product {
  id: number;
  tone: string;
  name: string;
  price: number;
  size: string[];
  color: string[];
  image: string | string[];
  category: string;
  description: string;
  badge?: string;
  reviews: ProductReview[];
}

const now = Date.now();

const seededReviews = (baseName: string, seed: number): ProductReview[] => {
  const reviewers = [
    'Aarav',
    'Meera',
    'Zara',
    'Kabir',
    'Ishaan',
    'Naina',
    'Vihaan',
    'Anaya',
    'Arjun',
    'Riya',
  ];

  const titles = [
    'Worth it!',
    'Great quality',
    'Super comfy',
    'Perfect fit',
    'Feels premium',
    'Nice color',
  ];

  const bodies = [
    'The fabric feels really good and the stitching is neat. After a few washes it still looks new.',
    'Loved the fit and comfort—wearing it daily now. The print looks clean and vibrant.',
    'Surprisingly premium for the price. The size chart was accurate for me.',
    'Fast delivery and the product matched the photos exactly. Will buy again.',
    'Soft and breathable. It drapes nicely and doesn’t feel stiff at all.',
    'Good finishing and the material feels durable. Overall very satisfied.',
  ];
  const sizes = [
    "M",
    "L",
    "XL",
    "XXL",
  ];

  const colors = [
    "Black",
    "White",
    "Red",
    "Green",
    "Blue",
    "Yellow",
    "Purple",
    "Orange",
    "Pink",
    "Brown",
    "Gray",
  ];

  const ratings = [5, 4, 5, 4, 5, 5, 4, 5, 4, 5];

  return new Array(6).fill(0).map((_, i) => {
    const reviewer = reviewers[(i + seed) % reviewers.length];
    const rating = ratings[(i + seed) % ratings.length];
    const title = titles[(i + seed * 2) % titles.length];
    const body = bodies[(i + seed * 3) % bodies.length];
    const size = sizes[(i + seed * 4) % sizes.length];
    const color = colors[(i + seed * 5) % colors.length];

    return {
      id: `${baseName}-${seed}-${i}`,
      name: reviewer,
      rating,
      title,
      body,
      size,
      color,
      createdAt: now - (seed * 86400000 + i * 19200000),
    };
  });
};

export const products: Product[] = [
  {
    id: 1,
    tone: 'Energetic',
    name: 'Goku Anime Tshirt',
    price: 890.0,
    size: ['M', 'L', 'XL', 'XXL'],
    color: ['Black', 'Beige'],
    image: ['/goku1.jpg', '/goku2.jpg', '/goku3.jpg', '/Goku.jpg', '/goku (2).jpg'],
    category: 'Mens',
    description: `Bring the spirit of adventure and nostalgia to your wardrobe with this premium oversized Goku Anime T-Shirt. Featuring an eye-catching full-back print of young Goku surrounded by cloud-inspired artwork and subtle Dragon Ball detailing on the sleeve, this tee is designed for true anime fans.

Crafted from a soft, breathable cotton blend, it offers a relaxed oversized fit for all-day comfort and effortless streetwear style. Whether you're heading out with friends, attending conventions, or simply expressing your love for Dragon Ball, this statement piece is made to stand out.

Features:
⚡ Premium cotton blend fabric
👕 Relaxed oversized fit
🎨 High-quality full-back Goku artwork
🐉 Exclusive Dragon Ball sleeve detail
🌿 Soft, breathable, and durable
🧼 Machine washable for easy care

Perfect for: Anime lovers, Dragon Ball fans, casual streetwear, and everyday comfort.`,
    badge: 'Sustainable',
    reviews: seededReviews('goku', 1),
  },
  {
    id: 2,
    tone: 'Playful',
    name: 'Anime Girls overszied T-shirt',
    price: 590.0,
    size: ['M', 'L', 'XL', 'XXL'],
    image: ['/Anime Girls overszied.jpg'],
    color: ['Black'],
    category: 'Womens',
    description: `Make a bold statement with this stylish Anime Girls Oversized T-Shirt, designed for those who love Japanese aesthetics and effortless streetwear. Featuring a vibrant high-definition anime artwork on the front, this tee combines comfort and style in one eye-catching piece.
Crafted from a premium cotton blend, the oversized silhouette provides a relaxed fit and breathable feel, making it perfect for everyday wear. Whether you're heading out with friends, exploring the city, or expressing your love for anime culture, this tee delivers both comfort and personality.
Features
🌸 Premium cotton blend fabric
👕 Trendy oversized fit for maximum comfort
🎨 High-quality anime graphic print
✨ Soft, breathable, and lightweight feel
🌿 Durable fabric with long-lasting colors
🧼 Easy-care, machine washable
Perfect for: Anime enthusiasts, casual streetwear lovers, everyday outfits, and anyone who wants to add a touch of Japanese-inspired style to their wardrobe.`,
    badge: 'Premium',
    reviews: seededReviews('anime-girls', 2),
  },
  {
    id: 3,
    tone: 'Mysterious',
    name: 'Demon Slayer Jacket',
    price: 1499.0,
    size: ['M', 'L', 'XL', 'XXL'],
    color: [],
    image: ['/Demon Slayer Jacket.jpg'],
    category: 'Unisex',
    description: `Channel the spirit of the Demon Slayer Corps with this stylish Demon Slayer Inspired Jacket, featuring the iconic green and black checkered pattern made famous by Tanjiro Kamado. Designed for anime fans and streetwear enthusiasts alike, this statement piece blends Japanese aesthetics with everyday comfort.

Crafted from a premium cotton blend, the relaxed fit offers a lightweight feel and effortless style, making it perfect for casual outings, conventions, or layering over your favorite outfits. Whether you're a devoted Demon Slayer fan or simply love bold, unique fashion, this jacket is made to stand out.

Features

⚔️ Iconic Demon Slayer-inspired checkered design
👕 Relaxed unisex fit for all-day comfort
🌿 Premium cotton blend fabric
✨ Lightweight, breathable, and durable
🎌 Perfect for anime-inspired streetwear looks
🧼 Easy-care and machine washable

Perfect for: Anime enthusiasts, Demon Slayer fans, cosplay-inspired outfits, casual streetwear, and everyday wear with a touch of Japanese style.`,
    badge: 'Best Seller',
    reviews: seededReviews('demon-slayer', 3),
  },
  {
    id: 4,
    tone: 'Playful',
    name: 'Girl Oversized Tshirt',
    price: 599.0,
    size: ['M', 'L', 'XL', 'XXL'],
    image: ['/Girl Oversized Tshirt.jpg'],
    color: ['Green'],
    category: 'Womens',
    description: 'Breathable, high-quality cotton shirt for effortless summer style.',
    badge: 'Sustainable',
    reviews: seededReviews('girl-oversized', 4),
  },
  {
    id: 5,
    tone: 'Playful',
    name: 'Girls Oversized Tshirt',
    price: 699.0,
    size: ['M', 'L', 'XL', 'XXL'],
    image: '/Girls Oversized tshirt.jpg',
    color: ['Pink'],
    category: 'Womens',
    description: `Soft pastel tones meet anime-inspired art in this relaxed oversized tee. Made from premium cotton blend for everyday comfort and effortless style.

🌸 Oversized fit
🎨 High-quality anime print
☁️ Soft & breathable fabric
🧼 Machine washable
✨ Perfect for casual streetwear`,
    badge: 'New',
    reviews: seededReviews('girls-oversized', 5),
  },
  {
    id: 6,
    tone: 'Energetic',
    name: 'Lufy Anime Oversized Tshirt',
    price: 699.0,
    size: ['M', 'L', 'XL', 'XXL'],
    color: ['White', 'Beige'],
    image: '/Lufy Anime Oversized Tshirt.jpg',
    category: 'Men',
    description: `Set sail in style with this One Piece-inspired oversized tee featuring Luffy's iconic Wanted poster design. Made from a soft premium cotton blend for all-day comfort and a relaxed streetwear look.

🏴‍☠️ Vintage Wanted poster print
👕 Relaxed oversized fit
☁️ Soft & breathable fabric
🎨 High-quality long-lasting print
🧼 Machine washable
✨ Perfect for One Piece fans and everyday wear`,
    badge: 'Sustainable',
    reviews: seededReviews('luffy', 6),
  },
  {
    id: 7,
    tone: 'Mysterious',
    name: 'One Piece Oversized Tshirt',
    price: 699.0,
    size: ['M', 'L', 'XL', 'XXL'],
    color: ['Black', 'White', 'Beige'],
    image: ['/one piece oversized tshirt.jpg', '/One Piece Ovesized Tshirt.jpg'],
    category: 'Mens',
    description: `Show your pirate spirit with this One Piece-inspired oversized tee featuring an epic back print. Crafted from a premium cotton blend, it delivers all-day comfort with a bold streetwear vibe.

🏴‍☠️ Exclusive One Piece artwork
👕 Relaxed oversized fit
☁️ Soft & breathable fabric
🎨 High-quality durable print
🧼 Machine washable
✨ Perfect for anime fans and casual wear`,
    badge: 'New',
    reviews: seededReviews('one-piece', 7),
  },
  {
    id: 8,
    tone: 'Mysterious',
    name: 'Pirated One Piece Oversized Tshirt',
    price: 899.0,
    size: ['M', 'L', 'XL', 'XXL'],
    color: ['White'],
    image: ['/Pirated One Piece Oversized Tshirt.jpg', '/frontlufi.png'],
    category: 'Mens',
    description: `Unleash Gear 5 energy with this premium oversized tee featuring an epic Luffy back print. Designed for comfort and bold streetwear style, it's a must-have for every One Piece fan.

⚡ Gear 5 Luffy artwork
👕 Relaxed oversized fit
☁️ Soft premium cotton blend
🎨 High-definition durable print
🧼 Machine washable
🏴‍☠️ Perfect for anime lovers and everyday wear`,
    reviews: seededReviews('pirated-one-piece', 8),
  },
  {
    id: 9,
    tone: 'Mysterious',
    name: 'Pirated One Piece Oversized Tshirt',
    price: 799.0,
    size: ['M', 'L', 'XL', 'XXL'],
    color: ['White', 'Beige'],
    image: ['/Pirated One Piece Oversized Tshirt (2).jpg'],
    category: 'Mens',
    description: `Unleash Gear 5 energy with this premium oversized tee featuring an epic Luffy back print. Designed for comfort and bold streetwear style, it's a must-have for every One Piece fan.

⚡ Gear 5 Luffy artwork
👕 Relaxed oversized fit
☁️ Soft premium cotton blend
🎨 High-definition durable print
🧼 Machine washable
🏴‍☠️ Perfect for anime lovers and everyday wear`,
    reviews: seededReviews('pirated-one-piece-2', 9),
  },
  {
    id: 10,
    tone: 'Mysterious',
    name: 'One Piece Ukiyo-E Oversized T-Shirt',
    price: 899.0,
    size: ['M', 'L', 'XL', 'XXL'],
    color: ['Black', 'Beige'],
    image: ['/Pirated One Piece Oversized Tshirt (1).jpg'],
    category: 'Mens',
    description: `One Piece Ukiyo-E Oversized T-Shirt

Inspired by Japanese art and the Grand Line, this oversized tee features an exclusive One Piece back print with timeless wave motifs. Crafted for comfort and standout streetwear style.

🌊 Japanese-inspired One Piece artwork
👕 Relaxed oversized fit
☁️ Soft premium cotton blend
🎨 Fade-resistant high-quality print
🧼 Machine washable
🏴‍☠️ Perfect for anime lovers and everyday wear`,
    reviews: seededReviews('oversized-1', 10),
  },
  {
    id: 11,
    tone: 'Mysterious',
    name: 'One Piece Sunset Oversized T-Shirt',
    price: 699.0,
    size: ['M', 'L', 'XL', 'XXL'],
    color: ['White', 'Beige'],
    image: ['/One piece oversized Tshirt (1).jpg'],
    category: 'Mens',
    description: `One Piece Sunset Oversized T-Shirt

Sail into the sunset with this premium oversized tee featuring Luffy and the Thousand Sunny in a stunning silhouette design. Made for comfort and everyday style.

🌅 Epic Luffy sunset artwork
👕 Relaxed oversized fit
☁️ Soft & breathable fabric
🎨 Long-lasting premium print
🧼 Machine washable
🏴‍☠️ Ideal for One Piece fans and casual streetwear`,
    reviews: seededReviews('oversized-2', 11),
  },
  {
    id: 12,
    tone: 'Lufy',
    name: 'Lufy One Piece Oversized T-Shirt',
    price: 799.0,
    size: ['M', 'L', 'XL', 'XXL'],
    color: ['White', 'Beige'],
    image: ['/image.png'],
    category: 'Mens',
    description: `Lufy One Piece Oversized T-Shirt

Sail into the sunset with this premium oversized tee featuring Luffy and the Thousand Sunny in a stunning silhouette design. Made for comfort and everyday style.

🌅 Epic Luffy sunset artwork
👕 Relaxed oversized fit
☁️ Soft & breathable fabric
🎨 Long-lasting premium print
🧼 Machine washable
🏴‍☠️ Ideal for One Piece fans and casual streetwear`,
    reviews: seededReviews('oversized-2', 11),
  },
];


export const categories = ['All', 'Mens', 'Womens', 'Unisex'];

export const getProductSlug = (product: Product): string => {
  if (product.id === 9) {
    return 'pirated-one-piece-oversized-tshirt-v2';
  }
  return product.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const getProductBySlugOrId = (slugOrId: string | undefined): Product | undefined => {
  if (!slugOrId) return undefined;
  const idNum = Number(slugOrId);
  if (!isNaN(idNum)) {
    return products.find(p => p.id === idNum);
  }
  return products.find(p => getProductSlug(p) === slugOrId);
};


