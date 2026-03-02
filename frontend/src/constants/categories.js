export const CATEGORIES = [
  {
    id: "mobiles",
    name: "Mobiles",
    slug: "mobiles",
    icon: "📱",
    subcategories: [
      "Smartphones",
      "Feature Phones",
      "Tablets",
      "Mobile Accessories",
    ],
  },
  {
    id: "cars",
    name: "Cars",
    slug: "cars",
    icon: "🚗",
    subcategories: [
      "Suzuki",
      "Toyota",
      "Honda",
      "Kia",
      "Hyundai",
      "Daihatsu",
      "Other Cars",
    ],
  },
  {
    id: "motorcycles",
    name: "Motorcycles",
    slug: "motorcycles",
    icon: "🏍️",
    subcategories: [
      "Honda",
      "Yamaha",
      "Suzuki",
      "United",
      "Ravi",
      "Other Bikes",
    ],
  },
  {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    icon: "💻",
    subcategories: [
      "TVs",
      "Laptops",
      "AC & Coolers",
      "Refrigerators",
      "Washing Machines",
      "Generators",
      "Cameras",
      "Other Electronics",
    ],
  },
  {
    id: "furniture-home",
    name: "Furniture & Home",
    slug: "furniture-home",
    icon: "🛋️",
    subcategories: [
      "Sofa & Chairs",
      "Beds & Wardrobes",
      "Tables & Dining",
      "Kitchen Items",
      "Home Decor",
      "Other Furniture",
    ],
  },
  {
    id: "fashion-beauty",
    name: "Fashion & Beauty",
    slug: "fashion-beauty",
    icon: "👗",
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Kids Clothing",
      "Shoes",
      "Bags & Accessories",
      "Beauty Products",
      "Jewellery",
    ],
  },
  {
    id: "others",
    name: "Others",
    slug: "others",
    icon: "📦",
    subcategories: [
      "Sports & Fitness",
      "Books & Magazines",
      "Musical Instruments",
      "Agriculture",
      "Pets",
      "Misc",
    ],
  },
];

export const getCategoryBySlug = (slug) =>
  CATEGORIES.find((cat) => cat.slug === slug);

export const getCategoryById = (id) =>
  CATEGORIES.find((cat) => cat.id === id);