// Arihant Luxe Authentic Product Catalog
export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  title?: string;
  size: string;
  body: string;
  color: string;
  createdAt: number;
}

export interface Product {
  id: number;
  slug?: string;
  tone?: string;
  name: string;
  price: number;
  size: string[];
  color: string[];
  image: string | string[];
  images?: string[];
  category: string;
  description: string;
  badge?: string | null;
  stock?: number;
  createdAt?: string | Date;
  reviews?: ProductReview[];
}

export const products: Product[] = [
  {
    "id": 45,
    "slug": "meenakshi-temple-3-layer-bridal-set-1794931128617",
    "name": "Meenakshi Temple 3-Layer Bridal Set",
    "price": 1599,
    "category": "Jewellery",
    "description": "A grand 3-layer temple jewellery set with pink bead work, gold Lakshmi motifs and a green stone pendant — gives a full royal bridal look for weddings and big functions.Want me to also give you short Instagram captions + prices format for these 5?",
    "badge": null,
    "stock": 10,
    "size": [],
    "color": [],
    "createdAt": "2026-11-17T15:58:48.618Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794930973/809844039_18099727544134417_8193846430289129640_n.heic.jpg"
  },
  {
    "id": 44,
    "slug": "gulabi-pearl-kundan-haram-set-1794931082799",
    "name": "Gulabi Pearl Kundan Haram Set",
    "price": 1599,
    "category": "Jewellery",
    "description": "A delicate pink and green kundan haram with pearl drops and matching earrings — soft, pretty and easy to carry, ideal for sangeet, mehndi and day weddings.",
    "badge": null,
    "stock": 10,
    "size": [],
    "color": [],
    "createdAt": "2026-11-17T15:58:02.800Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794930973/799308254_18097426241134417_1676211702489192134_n.heic.jpg"
  },
  {
    "id": 43,
    "slug": "swarnam-gold-temple-haram-set-1794931046747",
    "name": "Swarnam Gold Temple Haram Set",
    "price": 1299,
    "category": "Jewellery",
    "description": "A classic antique gold haram with a soft pink stone choker, matching vanki and earrings — elegant, lightweight and perfect for sarees, weddings and festive occasions.",
    "badge": null,
    "stock": 10,
    "size": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "color": [],
    "createdAt": "2026-11-17T15:57:26.748Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794930973/811616477_18100195736134417_7952583195708772379_n.heic.jpg"
  },
  {
    "id": 42,
    "slug": "lakshmi-temple-bridal-jewellery-set-1794931013343",
    "name": "Lakshmi Temple Bridal Jewellery Set",
    "price": 1399,
    "category": "Jewellery",
    "description": "A complete South Indian temple set with Lakshmi pendant, choker, long haram, waist belt and earrings in antique gold — made for weddings, it gives you a full bridal look in one set.",
    "badge": null,
    "stock": 10,
    "size": [],
    "color": [],
    "createdAt": "2026-11-17T15:56:53.344Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794930973/799571031_18097425683134417_6526111532817425258_n.heic.jpg"
  },
  {
    "id": 41,
    "slug": "rajkumari-kundan-choker-haram-set-1794930984375",
    "name": "Rajkumari Kundan Choker & Haram Set",
    "price": 1299,
    "category": "Jewellery",
    "description": "A royal 2-layer set with a wide kundan choker in pink and green stones and a matching long haram with green bead drops — perfect for brides who want a rich, traditional look without heavy gold.",
    "badge": "New Arrival",
    "stock": 10,
    "size": [],
    "color": [],
    "createdAt": "2026-11-17T15:56:24.381Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794930974/811711018_18100224851134417_5540090349699950534_n.heic.jpg"
  },
  {
    "id": 39,
    "slug": "monarch-regent-embroidered-silk-lehenga-set-1794909297622",
    "name": "MONARCH REGENT EMBROIDERED SILK LEHENGA SET",
    "price": 1099,
    "category": "Fashion",
    "description": "Multicolor patchwork lehenga in green, yellow and orange with traditional figurine and peacock motifs. Includes embroidered blouse and orange organza dupatta. Perfect for wedding, sangeet & festive occasions.",
    "badge": "Bestseller",
    "stock": 6,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T09:54:57.627Z",
    "image": "/api/products/39/image"
  },
  {
    "id": 38,
    "slug": "azar-cotton-farshi-salwar-set-1794907742615",
    "name": "AZAR COTTON FARSHI SALWAR SET",
    "price": 749,
    "category": "Fashion",
    "description": "Beige and sage green geometric print co-ord set. Includes V-neck loose fit top with flared sleeves and matching wide-leg pants. Comfortable, chic and perfect for daily & vacation wear.",
    "badge": "New Arrival",
    "stock": 8,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T09:29:02.627Z",
    "image": "/api/products/38/image"
  },
  {
    "id": 37,
    "slug": "sepideh-cotton-farshi-salwar-set-1794907571608",
    "name": "SEPIDEH COTTON FARSHI SALWAR SET",
    "price": 599,
    "category": "Fashion",
    "description": "Navy blue polka dot cold-shoulder kurta with mustard yellow chevron palazzo set. Features side tie-up detailing with tassels and pearl lace hem. Fun, stylish and perfect for casual & festive wear.",
    "badge": "New Arrival",
    "stock": 8,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T09:26:11.773Z",
    "image": "/api/products/37/image"
  },
  {
    "id": 36,
    "slug": "lamea-white-printed-farshi-salwar-set-1794907468827",
    "name": "LAMEA WHITE PRINTED FARSHI SALWAR SET",
    "price": 699,
    "category": "Fashion",
    "description": "Ivory white kurta set with sage green block print. Includes straight kurta with V-neck, wide-leg palazzo, and matching printed dupatta. Soft, comfortable and perfect for casual & festive wear.",
    "badge": "Bestseller",
    "stock": 15,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T09:24:29.530Z",
    "image": "/api/products/36/image"
  },
  {
    "id": 35,
    "slug": "neelika-blue-rayon-anarkali-suit-set-1794907137319",
    "name": "NEELIKA BLUE RAYON ANARKALI SUIT SET",
    "price": 1099,
    "category": "Fashion",
    "description": "A soft taupe-brown lehenga set with a delicate beige floral print, featuring a sleeveless sweetheart-neckline blouse with pearl drops, a flared lehenga with a tie-up waist and pearl latkan, and a matching dupatta with a pearl border — lightweight, elegant and perfect for mehndi, sangeet and day weddings.",
    "badge": "Bestseller",
    "stock": 20,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL",
      "4XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T09:18:58.023Z",
    "image": "/api/products/35/image"
  },
  {
    "id": 34,
    "slug": "elarvisha-flor-lehenga-set-1794906723346",
    "name": "ELARVISHA FLORÉ LEHENGA SET",
    "price": 999,
    "category": "Fashion",
    "description": "Grace in every detail.\n\nThis elegant 3-piece lehenga set features a soft floral print in a beautiful taupe-brown shade. Made for daytime weddings, mehndi, sangeet and festive brunches, it is lightweight, breezy and easy to carry all day.\n\nThe sleeveless blouse has a sweetheart neckline with delicate pearl drops at the hem. The flared lehenga comes with a stylish side tie-up and pearl latkan detailing. Paired with a matching printed dupatta with pearl lace border to complete the look.\n\nSimple, soft and effortlessly pretty.",
    "badge": "New Arrival",
    "stock": 7,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL",
      "4XL",
      "5XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T09:12:04.156Z",
    "image": "/api/products/34/image"
  },
  {
    "id": 33,
    "slug": "kalin-raatri-straight-kurta-set-1794906141921",
    "name": "Kalin Raatri Straight Kurta Set",
    "price": 1299,
    "category": "Fashion",
    "description": "Elevate your festive style with the Kalin Raatri Straight Kurta Set. Crafted from rich black crepe, this three-piece ensemble features detailed geometric print panels, a broad embroidered border along the hem, and classic quarter-length sleeves. It's paired with solid straight pants and a sheer black organza dupatta finished with gold lace edging for an effortlessly regal look.",
    "badge": "New Arrival",
    "stock": 15,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL",
      "4XL",
      "5XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T09:02:23.254Z",
    "image": "/api/products/33/image"
  },
  {
    "id": 30,
    "slug": "premimum-lehenga-1794887195757",
    "name": "Red & Orange Multi-Panel Printed & Embroidered Bridal Lehenga Choli Set",
    "price": 1699,
    "category": "Fashion",
    "description": "Make a striking statement with this vibrant red and sunrise orange lehenga choli set. Featuring flared multi-panel kalidar skirt construction, a rich sleeveless sweetheart-neck crop blouse, and a contrasting mustard-yellow embroidered net dupatta, it's engineered for Mehendi, Sangeet, or wedding festivities.",
    "badge": "Exclusive",
    "stock": 12,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:46:35.758Z",
    "image": "/api/products/30/image"
  },
  {
    "id": 29,
    "slug": "premimum-lehenga-1794887053044",
    "name": "Lavender Purple Floral Embroidered Raw Silk Lehenga Choli Set",
    "price": 1899,
    "category": "Fashion",
    "description": "Make a regal statement in this soft lavender purple lehenga set. Crafted from rich raw silk, it features heavy threadwork and sequin embroidery across the skirt and sweet-heart neckline blouse. Paired with a delicate matching organza dupatta with scalloped borders, it's tailor-made for Sangeet, Mehendi, or wedding receptions.",
    "badge": "Exclusive",
    "stock": 2,
    "size": [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL",
      "4XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:44:13.045Z",
    "image": "/api/products/29/image"
  },
  {
    "id": 28,
    "slug": "premimum-lehenga-1794887011320",
    "name": "Magenta Pink Jacquard Silk Anarkali Suit Set",
    "price": 1299,
    "category": "Fashion",
    "description": "Exude charm and elegance in this vibrant fuchsia pink Anarkali suit set, richly adorned with intricate floral embroidery and distinctive parrot motifs along the neckline. Designed with a classic sweetheart neckline and three-quarter sleeves, the flowing silhouette is complemented by a matching solid dupatta finished with delicate gota lace edging. Perfect for festive celebrations, weddings, and cultural festivities.",
    "badge": "Exclusive",
    "stock": 10,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:43:31.321Z",
    "image": "/api/products/28/image"
  },
  {
    "id": 27,
    "slug": "premimum-lehenga-1794886959365",
    "name": "Beige Metallic Anarkali Suit Set with Floral Embroidery and Palazzos",
    "price": 1589,
    "category": "Fashion",
    "description": "Graceful and radiant, this beige metallic Anarkali suit set features a classic scoop neckline and voluminous flared silhouette, beautifully highlighted with vibrant multi-color floral embroidery along the hem and matching dupatta. Paired with comfortable coordinating palazzo pants, this elegant ensemble effortlessly combines traditional artistry with modern festive style, making it a perfect choice for weddings, receptions, and evening celebrations.",
    "badge": "Bestseller",
    "stock": 3,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL",
      "4XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:42:39.366Z",
    "image": "/api/products/27/image"
  },
  {
    "id": 26,
    "slug": "premimum-lehenga-1794886879598",
    "name": "Off-White Flared Anarkali Suit Set with Contrast Red Embroidered Dupatta",
    "price": 899,
    "category": "Fashion",
    "description": "Elegant and graceful, this off-white flared Anarkali suit features subtle embroidered motifs scattered across the bodice and skirt, paired with matching flared bottoms. The look is beautifully elevated by a stunning contrast red and beige traditional dupatta/shawl heavily patterned with intricate multicolored floral and paisley embroidery along the borders, making it an exquisite choice for festive celebrations, weddings, and traditional gatherings.",
    "badge": "Bestseller",
    "stock": 6,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL",
      "4XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:41:19.599Z",
    "image": "/api/products/26/image"
  },
  {
    "id": 25,
    "slug": "premimum-lehenga-1794886824822",
    "name": "Off-White Embroidered Ethnic Suit Set & Tunic Co-ord Set Collection",
    "price": 999,
    "category": "Fashion",
    "description": "Ivory-beige short tunic featuring delicate silver-gold embroidery, cut-out keyhole neckline, and embellished bead hems, styled with matching straight-leg trousers for an understated yet sophisticated festive look.",
    "badge": "Limited Edition",
    "stock": 7,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:40:24.823Z",
    "image": "/api/products/25/image"
  },
  {
    "id": 24,
    "slug": "premimum-lehenga-1794886785701",
    "name": "Teal Blue Floral Printed Silk Lehenga Choli Set with Organza Dupatta",
    "price": 799,
    "category": "Fashion",
    "description": "Make a charming entrance in this refreshing teal blue lehenga choli set. Crafted from smooth, rich silk fabric, it showcases vivid multi-colored floral digital prints across the flared skirt and sleeveless blouse. It's paired with a lightweight organza dupatta finished with gold lace borders, making it ideal for Sangeet nights, Mehendi parties, or festive events.",
    "badge": "New Arrival",
    "stock": 15,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:39:45.702Z",
    "image": "/api/products/24/image"
  },
  {
    "id": 23,
    "slug": "premimum-lehenga-1794886750138",
    "name": "Dusty Rose Beige Floral Embroidered Straight Lawn Suit Set with Printed Dupatta",
    "price": 799,
    "category": "Fashion",
    "description": "Softly refined and effortlessly elegant, this dusty rose beige suit set is crafted from breathable lawn cotton. It features dense floral threadwork embroidery along the neckline and hemline, paired with matching straight-fit trousers and a printed drape dupatta. It's tailored for daytime celebrations, festive gatherings, and summer occasion wear.",
    "badge": "Bestseller",
    "stock": 4,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL",
      "4XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:39:10.140Z",
    "image": "/api/products/23/image"
  },
  {
    "id": 21,
    "slug": "premimum-lehenga-1794886638449",
    "name": "Peacock Teal Blue Kalidar Anarkali Suit Set with Embroidered Organza Dupatta",
    "price": 949,
    "category": "Fashion",
    "description": "Make a regal entrance with this vibrant peacock teal blue Anarkali suit set. Tailored in a voluminous kalidar silhouette, it features dense golden zari and sequin work across the sweetheart-neck bodice, paired with a lightweight sheer organza dupatta finished with ornate scalloped borders. It's built for Sangeet nights, festive pujas, and wedding receptions.",
    "badge": "New Arrival",
    "stock": 13,
    "size": [
      "M",
      "L",
      "XL",
      "XXL",
      "3XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:37:18.450Z",
    "image": "/api/products/21/image"
  },
  {
    "id": 19,
    "slug": "premimum-lehenga-1794886411069",
    "name": "Mustard Yellow Printed Georgette Short Kurti with Tiered Flared Lehenga Set",
    "price": 1199,
    "category": "Fashion",
    "description": "Bring a radiant burst of sunshine to festive events with this mustard yellow ethnic set. Tailored in lightweight georgette, it features a printed sleeveless short kurti with delicate border embroidery, paired with a high-flaring tiered lehenga skirt and a matching draped dupatta. It's designed for Haldi functions, Sangeet parties, and festive celebrations.",
    "badge": "Bestseller",
    "stock": 20,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL",
      "4XL",
      "5XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:33:31.070Z",
    "image": "/api/products/19/image"
  },
  {
    "id": 18,
    "slug": "premimum-lehenga-1794886382768",
    "name": "Dusty Slate Blue Printed Kalidar Anarkali Suit Set with Embroidered Yoke & Dupatta",
    "price": 999,
    "category": "Fashion",
    "description": "Channel subtle festive elegance in this dusty slate blue 3-piece Anarkali set. Tailored in soft, breathable fabric, it showcases an allover micro-printed kalidar flared skirt, a chest-embroidered V-neck yoke, and a matching printed drape dupatta. It's built for daytime pujas, intimate Sangeets, or festive family gatherings.",
    "badge": "New Arrival",
    "stock": 10,
    "size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL",
      "4XL"
    ],
    "color": [],
    "createdAt": "2026-11-17T03:33:02.997Z",
    "image": "/api/products/18/image"
  },
  {
    "id": 15,
    "slug": "jellewls-by-arihant-1794840712903",
    "name": "Noor Pearl Kundan Bridal Set",
    "price": 1399,
    "category": "Jewellery",
    "description": "A soft white and pink pearl kundan set with choker and long haram — light, elegant and perfect for brides who want a clean, royal look that goes with any lehenga",
    "badge": "Exclusive",
    "stock": 4,
    "size": [
      "Free Size"
    ],
    "color": [],
    "createdAt": "2026-11-16T14:51:52.904Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794468708/SaveInta.com_779001377_18092923688134417_7243571650961316643_n.jpg"
  },
  {
    "id": 13,
    "slug": "royal-set-1794840561270",
    "name": "Heera Gold Temple Choker Set",
    "price": 1799,
    "category": "Jewellery",
    "description": "A bold antique gold temple set with choker, long haram and earrings — rich, traditional and made to stand out at weddings and festive functions",
    "badge": "Exclusive",
    "stock": 5,
    "size": [
      "Free Size"
    ],
    "color": [],
    "createdAt": "2026-11-16T14:49:21.271Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794468704/SaveInta.com_839065085_18105269864134417_5172944859217356965_n.jpg"
  },
  {
    "id": 4,
    "slug": "regal-elegance-redefined",
    "name": "Regal Elegance Kundan Set",
    "price": 1299,
    "category": "Jewellery",
    "description": "Traditional multi-layer antique gold necklace featuring royal floral motifs, auspicious Goddess Lakshmi medallions, and fine pearl cluster drops.",
    "badge": "Exclusive",
    "stock": 7,
    "size": [
      "Free Size"
    ],
    "color": [],
    "createdAt": "2026-11-16T14:09:49.491Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794468702/SaveInta.com_837459884_18105269036134417_5928436424598684292_n.jpg"
  },
  {
    "id": 3,
    "slug": "royal-heritage-choker",
    "name": "Maharani Pearl Layered Haram Set",
    "price": 1499,
    "category": "Jewellery",
    "description": "A grand layered gold set with pearl drops and kundan work — heavy look but comfortable to wear, perfect for bridal entry and reception",
    "badge": "Bestseller",
    "stock": 8,
    "size": [
      "Free Size"
    ],
    "color": [],
    "createdAt": "2026-11-16T14:09:49.268Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794468700/SaveInta.com_836084409_18105268616134417_8283239916345672048_n.jpg"
  },
  {
    "id": 2,
    "slug": "kundan-heritage-bridal-set",
    "name": "Chandni White Kundan Bridal Set",
    "price": 1199,
    "category": "Jewellery",
    "description": "A timeless white kundan and pearl set with choker and long haram — simple, classy and ideal for sangeet, engagement and day weddings",
    "badge": "Limited Edition",
    "stock": 2,
    "size": [
      "Free Size"
    ],
    "color": [],
    "createdAt": "2026-11-16T14:09:49.042Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794468676/SaveInta.com_783590034_18092923721134417_6321730807047660846_n.jpg"
  },
  {
    "id": 1,
    "slug": "12-kt-set",
    "name": "Swarna 3-Layer Pearl Temple Set",
    "price": 1699,
    "category": "Jewellery",
    "description": "A luxurious 3-layer gold set with pearl drops and temple motifs — gives a full bridal jewellery look in one set, no need to buy anything extra.",
    "badge": "Exclusive",
    "stock": 12,
    "size": [
      "Free Size"
    ],
    "color": [],
    "createdAt": "2026-11-16T14:09:48.590Z",
    "image": "https://res.cloudinary.com/deotzatzd/image/upload/v1794464738/SaveInta.com_790113459_18100362803134417_1032884424859532077_n.jpg"
  }
];

export const categories = ['All', 'Fashion', 'Jewellery', 'Clothing'];

export const getProductSlug = (product: Product): string => {
  if (product.slug) return product.slug;
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
  const clean = decodeURIComponent(slugOrId).toLowerCase().trim();
  const idNum = Number(clean);
  if (!isNaN(idNum)) {
    const found = products.find(p => p.id === idNum);
    if (found) return found;
  }
  return products.find(p => (p.slug && p.slug.toLowerCase() === clean) || getProductSlug(p) === clean);
};
