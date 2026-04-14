export const RECIPES = [
  {
    id: 1,
    title: "Mercimek Çorbası",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
    calories: 210,
    servings: 4,
    category: "Diyet",
    dietitianApproved: true,
    ingredients: ["1 su bardağı kırmızı mercimek", "1 soğan", "2 diş sarımsak", "1 havuç", "1 yemek kaşığı zeytinyağı", "Tuz, kimyon, pul biber"],
    steps: [
      "Soğan ve sarımsağı kavurun.",
      "Havucu ekleyip 2 dakika daha kavurun.",
      "Mercimek ve 1 litre suyu ekleyin.",
      "20 dakika kısık ateşte pişirin.",
      "Blenderdan geçirin ve baharatları ekleyin.",
    ],
  },
  {
    id: 2,
    title: "Avokadolu Tost",
    image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600&q=80",
    calories: 320,
    servings: 2,
    category: "Vegan",
    dietitianApproved: true,
    ingredients: ["2 dilim tam buğday ekmeği", "1 olgun avokado", "Limon suyu", "Tuz, karabiber", "Kırmızı pul biber"],
    steps: [
      "Ekmeği kızartın.",
      "Avokadoyu çatalla ezin, limon suyu ve tuz ekleyin.",
      "Ekmeklere sürün ve baharatlarla süsleyin.",
    ],
  },
  {
    id: 3,
    title: "Çikolatalı Sufle",
    image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600&q=80",
    calories: 480,
    servings: 2,
    category: "Tatlı",
    dietitianApproved: false,
    ingredients: ["100g bitter çikolata", "2 yumurta", "50g tereyağı", "2 yemek kaşığı un", "3 yemek kaşığı şeker"],
    steps: [
      "Fırını 200°C'ye ısıtın.",
      "Çikolata ve tereyağını bain-marie usulü eritin.",
      "Yumurta ve şekeri çırpın, çikolatayla karıştırın.",
      "Unu ekleyip kalıplara dökün.",
      "12 dakika pişirin.",
    ],
  },
  {
    id: 4,
    title: "Kinoa Salatası",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    calories: 290,
    servings: 3,
    category: "Glütensiz",
    dietitianApproved: true,
    ingredients: ["1 su bardağı kinoa", "Cherry domates", "Salatalık", "Maydanoz", "Limon, zeytinyağı"],
    steps: [
      "Kinoayı yıkayıp 2 bardak suyla haşlayın.",
      "Sebzeleri doğrayın.",
      "Kinoa soğuyunca sebzelerle karıştırın.",
      "Limon ve zeytinyağı ile soslandırın.",
    ],
  },
  {
    id: 5,
    title: "Tavuk Sote",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80",
    calories: 370,
    servings: 4,
    category: "Diyet",
    dietitianApproved: true,
    ingredients: ["500g tavuk göğsü", "2 biber", "1 domates", "1 soğan", "Zeytinyağı, tuz, kekik"],
    steps: [
      "Tavukları küp şeklinde doğrayın.",
      "Yağda soğanı kavurun, tavukları ekleyin.",
      "Biber ve domatesi ekleyin.",
      "15 dakika orta ateşte pişirin.",
    ],
  },
  {
    id: 6,
    title: "Sütlaç",
    image: "https://images.unsplash.com/photo-1488477181228-c8b72d816d85?w=600&q=80",
    calories: 260,
    servings: 6,
    category: "Tatlı",
    dietitianApproved: false,
    ingredients: ["1 litre süt", "5 yemek kaşığı pirinç", "5 yemek kaşığı şeker", "2 yemek kaşığı nişasta", "Tarçın"],
    steps: [
      "Pirinci haşlayın.",
      "Süt, şeker ve nişastayı ekleyip koyulaşana kadar karıştırın.",
      "Kaplara dökün, fırında kızartın.",
      "Tarçın serpin.",
    ],
  },
];

export const getRecipeById = (id) => RECIPES.find((r) => r.id === parseInt(id));

export const searchRecipes = (query) =>
  RECIPES.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.ingredients.some((i) => i.toLowerCase().includes(query.toLowerCase()))
  );
