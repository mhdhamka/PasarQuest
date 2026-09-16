import { CollectibleFood, BadgeAchievement } from '../types';

export const COLLECTIBLE_FOODS: CollectibleFood[] = [
  // Common Street Foods
  {
    id: 'apam-balik',
    name: 'Crispy Apam Balik',
    malayName: 'Apam Balik Nipis & Tebal',
    category: 'dessert',
    rarity: 'common',
    xpValue: 60,
    description: 'Crispy or fluffy golden turnover pancake loaded with crushed roasted peanuts, creamy sweet corn, and cane sugar.',
    tasteProfile: 'Sweet, nutty, and buttery with a satisfying crunch',
    iconEmoji: '🥞',
  },
  {
    id: 'roti-john',
    name: 'Roti John Meleleh',
    malayName: 'Roti John Daging Berkeju',
    category: 'street-food',
    rarity: 'common',
    xpValue: 70,
    description: 'Toasted baguette grilled with seasoned minced beef, beaten egg, drizzled with chilli sauce, kewpie mayo, and melted cheese.',
    tasteProfile: 'Savory, spicy, and decadently saucy',
    iconEmoji: '🥖',
  },
  {
    id: 'satay-ayam',
    name: 'Kajang Style Satay',
    malayName: 'Satay Ayam & Daging Arang',
    category: 'street-food',
    rarity: 'common',
    xpValue: 65,
    description: 'Charcoal-grilled marinated chicken skewers served with rich chunky roasted peanut sauce, compressed rice cakes (nasi impit), and cucumber.',
    tasteProfile: 'Smoky, sweet, and aromatic lemongrass turmeric marinade',
    iconEmoji: '🍢',
  },
  {
    id: 'air-tebu',
    name: 'Fresh Cold Sugar Cane Juice',
    malayName: 'Air Tebu Perah Segar',
    category: 'drinks',
    rarity: 'common',
    xpValue: 50,
    description: 'Pressed-to-order sugarcane crushed through steel rollers with a splash of fresh calamansi lime over crushed ice.',
    tasteProfile: 'Ultra-refreshing, crisp natural sweetness with citrus zest',
    iconEmoji: '🥤',
  },
  {
    id: 'keropok-lekor',
    name: 'Crispy Keropok Lekor Terengganu',
    malayName: 'Keropok Lekor Crispy',
    category: 'snack',
    rarity: 'common',
    xpValue: 55,
    description: 'Traditional deep-fried fish sausages made with high fish ratio and sago flour, served piping hot with sweet tamarind chili dip.',
    tasteProfile: 'Savory, crunchy exterior, chewy center with robust fish umami',
    iconEmoji: '🥢',
  },
  {
    id: 'kuih-muih',
    name: 'Nyonya Kuih Assortment',
    malayName: 'Kuih Seri Muka & Lapis',
    category: 'dessert',
    rarity: 'common',
    xpValue: 50,
    description: 'Vibrant handcrafted coconut and pandan steamed cakes including Seri Muka with glutinous rice and 9-layer Kuih Lapis.',
    tasteProfile: 'Rich coconut milk, fragrant pandan, and delicate sweetness',
    iconEmoji: '🍮',
  },
  {
    id: 'ayam-gunting',
    name: 'Extra Crispy Fried Chicken Chop',
    malayName: 'Ayam Gunting Pedas',
    category: 'snack',
    rarity: 'common',
    xpValue: 65,
    description: 'Giant boneless chicken breast coated in spiced batter, deep fried until golden, snipped into bite-sized strips and tossed in chili seasoning.',
    tasteProfile: 'Crackling crunch with fiery Sichuan or hot pepper kick',
    iconEmoji: '🍗',
  },

  // Rare Street Foods
  {
    id: 'stinky-tofu',
    name: 'Deep Fried Stinky Tofu',
    malayName: 'Chou Doufu Cheras Style',
    category: 'street-food',
    rarity: 'rare',
    xpValue: 120,
    description: 'Legendary night market fermented bean curd deep-fried to crispy airy perfection, topped with pickled cabbage, garlic puree, and chili oil.',
    tasteProfile: 'Pungent aroma opening into rich savory umami and tangy pickle balance',
    iconEmoji: '🥟',
  },
  {
    id: 'tau-foo-fah',
    name: 'Silky Soy Bean Pudding',
    malayName: 'Tau Foo Fah Gula Melaka',
    category: 'dessert',
    rarity: 'rare',
    xpValue: 95,
    description: 'Warm, melt-in-the-mouth silken tofu scooped directly from a wooden barrel, smothered in warm smoky caramelized Gula Melaka syrup.',
    tasteProfile: 'Silky smooth, gentle floral sweetness with deep palm sugar caramel',
    iconEmoji: '🥣',
  },
  {
    id: 'char-kway-teow',
    name: 'Wok Hei Char Kway Teow',
    malayName: 'Kway Teow Goreng Kerang Basah',
    category: 'street-food',
    rarity: 'rare',
    xpValue: 110,
    description: 'Flat rice noodles flash-fried over blazing charcoal fire with fresh cockles, succulent prawns, duck egg, bean sprouts, and chives.',
    tasteProfile: 'Intense breath of the wok (wok hei), savory soy sauce, and sea-sweet cockles',
    iconEmoji: '🍳',
  },
  {
    id: 'lok-lok',
    name: 'Steamboat Lok Lok Van',
    malayName: 'Lok Lok Celup & Bakar',
    category: 'street-food',
    rarity: 'rare',
    xpValue: 100,
    description: 'Iconic modified pickup truck laden with hundreds of skewered meats, seafood, quail eggs, and dumplings to boil or deep fry with satay dips.',
    tasteProfile: 'Fun, customizable skewers dipped in fiery tom yum or rich peanut gravy',
    iconEmoji: '🍢',
  },
  {
    id: 'mango-shake',
    name: 'Jumbo Mango Float Royale',
    malayName: 'Air Mangga Susu Ais Kepal',
    category: 'drinks',
    rarity: 'rare',
    xpValue: 90,
    description: 'Blended sweet Harum Manis or Chokanan mango shake crowned with condensed milk, vanilla ice cream, and mountain of fresh diced mango.',
    tasteProfile: 'Tropical explosion of luscious sweet mango and creamy milk',
    iconEmoji: '🥭',
  },

  // Legendary Street Foods
  {
    id: 'heritage-cendol',
    name: 'Generational Hand-Paved Cendol',
    malayName: 'Cendol Pulut Tapai Heritage',
    category: 'dessert',
    rarity: 'legendary',
    xpValue: 220,
    description: 'Shaved mountain of ice infused with freshly squeezed pandan leaf noodles, organic pressed coconut milk, slow-simmered dark Malacca Gula Melaka, and red beans.',
    tasteProfile: 'A masterpiece of smoky toffee palm sugar and rich fresh coconut cream',
    iconEmoji: '🍧',
  },
  {
    id: 'salted-egg-squid',
    name: 'Golden Salted Egg Giant Squid',
    malayName: 'Sotong Gergasi Telur Masin',
    category: 'street-food',
    rarity: 'legendary',
    xpValue: 250,
    description: 'Colossal whole fresh squid breaded in golden crumbs, fried, and wok-tossed in a creamy reduction of curry leaves, birds-eye chili, and cured salted egg yolks.',
    tasteProfile: 'Rich, buttery, savory-sweet salted egg glaze coating crisp, tender calamari',
    iconEmoji: '🦑',
  },
  {
    id: 'nasi-lemak-kukus',
    name: 'Claypot Fragrant Nasi Lemak Kukus',
    malayName: 'Nasi Lemak Kukus Sambal Sotong',
    category: 'street-food',
    rarity: 'legendary',
    xpValue: 240,
    description: 'Steamed ginger and lemongrass coconut rice served hot from cedar wood steamers with slow-simmered 4-hour dried chili squid sambal and crispy fried anchovies.',
    tasteProfile: 'Unforgettable harmony of velvety fragrant grains and fiery, complex onion sambal',
    iconEmoji: '🍛',
  },
];

export const BADGE_DEFINITIONS: BadgeAchievement[] = [
  {
    id: 'first-checkin',
    title: 'Pasar Rookie',
    description: 'Check in to your very first Malaysian night market.',
    icon: '📍',
    unlocked: false,
    category: 'markets',
  },
  {
    id: 'market-hunter-3',
    title: 'Stall Hopper',
    description: 'Check in to 3 different night markets across Malaysia.',
    icon: '🎪',
    unlocked: false,
    category: 'markets',
  },
  {
    id: 'market-master-10',
    title: 'Pasar Explorer King',
    description: 'Check in to 10 unique night markets.',
    icon: '👑',
    unlocked: false,
    category: 'markets',
  },
  {
    id: 'foodie-first-dish',
    title: 'Street Food Taster',
    description: 'Discover and log your first delicacy into your Pasar Dex.',
    icon: '🥢',
    unlocked: false,
    category: 'food',
  },
  {
    id: 'foodie-collector-5',
    title: 'Gourmet Wanderer',
    description: 'Collect 5 unique street food delicacies in your Pasar Dex.',
    icon: '🍽️',
    unlocked: false,
    category: 'food',
  },
  {
    id: 'foodie-rare-find',
    title: 'Treasure Hunter',
    description: 'Find a Rare or Legendary street food delicacy.',
    icon: '✨',
    unlocked: false,
    category: 'food',
  },
  {
    id: 'full-pasardex',
    title: 'Grand Pasar Master',
    description: 'Collect every street food delicacy in the entire Pasar Dex catalog!',
    icon: '🏆',
    unlocked: false,
    category: 'food',
  },
  {
    id: 'klang-valley-badge',
    title: 'Klang Valley Night Owl',
    description: 'Check in to markets located in both Kuala Lumpur and Selangor.',
    icon: '🏙️',
    unlocked: false,
    category: 'explorer',
  },
  {
    id: 'state-traveler',
    title: 'Peninsular Explorer',
    description: 'Check in to markets across 3 different Malaysian states.',
    icon: '🗺️',
    unlocked: false,
    category: 'explorer',
  },
  {
    id: 'streak-3',
    title: 'Flame Keeper',
    description: 'Maintain a 3-day consecutive daily check-in streak at night markets.',
    icon: '🔥',
    unlocked: false,
    category: 'streak',
  },
  {
    id: 'streak-7',
    title: 'Pasar Devotee',
    description: 'Achieve a 7-day consecutive daily check-in streak across Malaysia.',
    icon: '⚡',
    unlocked: false,
    category: 'streak',
  },
];

export function calculateLevel(totalXp: number): {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const levels = [
    { level: 1, xpRequired: 0, title: 'Pasar Rookie' },
    { level: 2, xpRequired: 150, title: 'Snack Explorer' },
    { level: 3, xpRequired: 350, title: 'Street Food Hunter' },
    { level: 4, xpRequired: 650, title: 'Stall Hopper' },
    { level: 5, xpRequired: 1050, title: 'Pasar Malam Connoisseur' },
    { level: 6, xpRequired: 1550, title: 'Night Market Specialist' },
    { level: 7, xpRequired: 2200, title: 'Malaysian Foodie Legend' },
    { level: 8, xpRequired: 3000, title: 'Grand Pasar Master' },
  ];

  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXp >= levels[i].xpRequired) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || { level: currentLevel.level + 1, xpRequired: currentLevel.xpRequired + 1000, title: 'Supreme Master' };
      break;
    }
  }

  const range = nextLevel.xpRequired - currentLevel.xpRequired;
  const currentInLevel = Math.max(0, totalXp - currentLevel.xpRequired);
  const progressPercent = Math.min(100, Math.round((currentInLevel / range) * 100));

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentLevelXp: totalXp,
    nextLevelXp: nextLevel.xpRequired,
    progressPercent,
  };
}

export function pickRandomDelicacy(marketName: string): CollectibleFood {
  // Chance roll: 60% common, 30% rare, 10% legendary
  const roll = Math.random() * 100;
  let targetPool: CollectibleFood[];

  if (roll < 10) {
    targetPool = COLLECTIBLE_FOODS.filter((f) => f.rarity === 'legendary');
  } else if (roll < 40) {
    targetPool = COLLECTIBLE_FOODS.filter((f) => f.rarity === 'rare');
  } else {
    targetPool = COLLECTIBLE_FOODS.filter((f) => f.rarity === 'common');
  }

  if (targetPool.length === 0) {
    targetPool = COLLECTIBLE_FOODS;
  }

  const randomIndex = Math.floor(Math.random() * targetPool.length);
  return targetPool[randomIndex];
}
