import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Prisma database seed...");

  // 1. Seed Users
  const ownerPasswordHash = await bcrypt.hash("owner123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@dinedirect.com" },
    update: {
      password: ownerPasswordHash,
      role: "RESTAURANT_OWNER",
    },
    create: {
      name: "Chef Vikram (Owner)",
      email: "owner@dinedirect.com",
      password: ownerPasswordHash,
      role: "RESTAURANT_OWNER",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@dinedirect.com" },
    update: {
      password: customerPasswordHash,
      role: "CUSTOMER",
    },
    create: {
      name: "Aarav Sharma",
      email: "customer@dinedirect.com",
      password: customerPasswordHash,
      role: "CUSTOMER",
    },
  });

  // 2. Seed Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "dinedirect-kitchen" },
    update: {
      name: "DineDirect Signature Kitchen",
      description: "Authentic North Indian, clay oven tandoori, rich gravies, and artisanal desserts.",
      isOpen: true,
    },
    create: {
      name: "DineDirect Signature Kitchen",
      slug: "dinedirect-kitchen",
      description: "Authentic North Indian, clay oven tandoori, rich gravies, and artisanal desserts.",
      isOpen: true,
    },
  });

  // 3. Seed 3 Categories (Starters, Mains, Desserts)
  const starters = await prisma.menuCategory.upsert({
    where: { id: "cat-starters" },
    update: { name: "Starters & Appetizers", sortOrder: 1, restaurantId: restaurant.id },
    create: {
      id: "cat-starters",
      name: "Starters & Appetizers",
      sortOrder: 1,
      restaurantId: restaurant.id,
    },
  });

  const mains = await prisma.menuCategory.upsert({
    where: { id: "cat-mains" },
    update: { name: "Signature Main Course", sortOrder: 2, restaurantId: restaurant.id },
    create: {
      id: "cat-mains",
      name: "Signature Main Course",
      sortOrder: 2,
      restaurantId: restaurant.id,
    },
  });

  const desserts = await prisma.menuCategory.upsert({
    where: { id: "cat-desserts" },
    update: { name: "Artisanal Desserts & Drinks", sortOrder: 3, restaurantId: restaurant.id },
    create: {
      id: "cat-desserts",
      name: "Artisanal Desserts & Drinks",
      sortOrder: 3,
      restaurantId: restaurant.id,
    },
  });

  // 4. Sample Dishes for Starters (6 items)
  const startersDishes = [
    {
      id: "dish-paneer-tikka",
      name: "Tandoori Paneer Tikka",
      description: "Char-grilled cottage cheese cubes marinated in Kashmiri red chili, yogurt, and crushed ajwain.",
      price: 289,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 18,
      imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "dish-crispy-corn",
      name: "Crispy Pepper Corn",
      description: "Golden fried sweet corn tossed with freshly cracked black pepper, curry leaves, and scallions.",
      price: 229,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 12,
      imageUrl: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "dish-murgh-tikka",
      name: "Old Delhi Chicken Tikka",
      description: "Boneless chicken thighs steeped in spiced yogurt, smoked with clove and mustard oil.",
      price: 349,
      isVeg: false,
      isAvailable: true,
      prepTimeMins: 20,
      imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "dish-dahi-ke-kebab",
      name: "Awadhi Dahi Ke Kebab",
      description: "Silky hung curd patties stuffed with caramelized onions and roasted coriander, pan-seared to perfection.",
      price: 269,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 15,
      imageUrl: null,
    },
    {
      id: "dish-mutton-seekh",
      name: "Gilafi Mutton Seekh Kebab",
      description: "Mouth-melting minced lamb skewers coated with diced bell peppers and toasted aromatic spices.",
      price: 429,
      isVeg: false,
      isAvailable: true,
      prepTimeMins: 22,
      imageUrl: null,
    },
    {
      id: "dish-hara-bhara",
      name: "Spinach & Pea Hara Bhara Kebab",
      description: "Crispy pan-fried spinach and green pea patties flavored with green chillies and roasted cumin.",
      price: 219,
      isVeg: true,
      isAvailable: false,
      prepTimeMins: 14,
      imageUrl: null,
    },
  ];

  for (const dish of startersDishes) {
    await prisma.menuItem.upsert({
      where: { id: dish.id },
      update: { ...dish, categoryId: starters.id },
      create: { ...dish, categoryId: starters.id },
    });
  }

  // 5. Sample Dishes for Mains (6 items)
  const mainsDishes = [
    {
      id: "dish-dal-makhani",
      name: "Dal Makhani 24-Hour Simmer",
      description: "Slow-cooked black lentils simmered overnight with vine-ripened tomatoes, butter, and rich cream.",
      price: 319,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 15,
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "dish-butter-chicken",
      name: "Classic Butter Chicken (Murgh Makhani)",
      description: "Tandoori pulled chicken cooked in a velvety tomato makhani sauce enriched with fenugreek and butter.",
      price: 399,
      isVeg: false,
      isAvailable: true,
      prepTimeMins: 20,
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "dish-paneer-butter-masala",
      name: "Shahi Paneer Lababdar",
      description: "Cottage cheese chunks enveloped in a rich, chunky cashew-tomato gravy topped with fresh coriander.",
      price: 339,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 18,
      imageUrl: null,
    },
    {
      id: "dish-mutton-rogan-josh",
      name: "Kashmiri Mutton Rogan Josh",
      description: "Tender fall-off-the-bone mutton slow-braised in aromatic Kashmiri spices and saffron-infused stock.",
      price: 489,
      isVeg: false,
      isAvailable: true,
      prepTimeMins: 25,
      imageUrl: null,
    },
    {
      id: "dish-dum-biryani",
      name: "Hyderabadi Dum Chicken Biryani",
      description: "Fragrant long-grain basmati rice layered with spiced chicken, caramelized onions, and saffron milk.",
      price: 379,
      isVeg: false,
      isAvailable: true,
      prepTimeMins: 25,
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "dish-garlic-naan",
      name: "Tandoori Garlic Butter Naan",
      description: "Hand-stretched leavened flatbread baked on tandoor walls and brushed with minced garlic and butter.",
      price: 79,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 8,
      imageUrl: null,
    },
  ];

  for (const dish of mainsDishes) {
    await prisma.menuItem.upsert({
      where: { id: dish.id },
      update: { ...dish, categoryId: mains.id },
      create: { ...dish, categoryId: mains.id },
    });
  }

  // 6. Sample Dishes for Desserts (5 items)
  const dessertsDishes = [
    {
      id: "dish-gulab-jamun",
      name: "Hot Gulab Jamun with Rabdi",
      description: "Soft khoya dumplings deep fried and soaked in cardamom rose syrup, served with creamy laccha rabdi.",
      price: 169,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 8,
      imageUrl: "https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "dish-rasmalai",
      name: "Saffron Pistachio Rasmalai",
      description: "Delicate chenna patties soaked in chilled saffron-infused evaporated milk garnished with sliced pistachios.",
      price: 189,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 5,
      imageUrl: null,
    },
    {
      id: "dish-kulfi",
      name: "Royal Matka Kulfi",
      description: "Traditional slow-boiled reduced milk ice cream with almonds, cardamom, and saffron in an earthen pot.",
      price: 149,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 5,
      imageUrl: null,
    },
    {
      id: "dish-mango-lassi",
      name: "Alphonso Mango Lassi",
      description: "Thick churned creamy yogurt blended with real Alphonso mango pulp and a pinch of green cardamom.",
      price: 139,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 5,
      imageUrl: null,
    },
    {
      id: "dish-masala-chai",
      name: "Kulhad Masala Chai",
      description: "Brewed Assam black tea with crushed ginger, cloves, and green cardamom, poured in a rustic clay cup.",
      price: 69,
      isVeg: true,
      isAvailable: true,
      prepTimeMins: 8,
      imageUrl: null,
    },
  ];

  for (const dish of dessertsDishes) {
    await prisma.menuItem.upsert({
      where: { id: dish.id },
      update: { ...dish, categoryId: desserts.id },
      create: { ...dish, categoryId: desserts.id },
    });
  }

  console.log("==================================================");
  console.log("✅ Seed completed successfully!");
  console.log(`🍽️ Restaurant: ${restaurant.name} (${restaurant.slug})`);
  console.log(`📂 Categories: 3 (Starters, Mains, Desserts)`);
  console.log(`🍲 Total Dishes: ${startersDishes.length + mainsDishes.length + dessertsDishes.length}`);
  console.log("🔑 RESTAURANT_OWNER: owner@dinedirect.com / owner123");
  console.log("👤 CUSTOMER:         customer@dinedirect.com / customer123");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
