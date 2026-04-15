const OpenAI = require("openai");

const createClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const buildRecipeContext = (recipe) => {
  const ingredients = recipe.ingredients
    .map((item) => `${item.name}${item.amount ? ` (${item.amount})` : ""}`)
    .join(", ");

  const steps = recipe.steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  return [
    `Tarif adı: ${recipe.title}`,
    `Açıklama: ${recipe.description || "Yok"}`,
    `Kategori: ${recipe.category}`,
    `Kaç kişilik: ${recipe.servings}`,
    `Kalori: ${recipe.calories}`,
    `Hazırlık süresi: ${recipe.preparationTime} dakika`,
    `Malzemeler: ${ingredients || "Yok"}`,
    `Yapılış:\n${steps || "Yok"}`,
  ].join("\n");
};

const generateRecipeAnswer = async ({ recipe, message }) => {
  const client = createClient();

  if (!client) {
    return null;
  }

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "Sen bir yemek tarifi asistanısın. Kullanıcıya sadece bu tarif hakkında Türkçe, kısa ve net cevap ver. Uydurma bilgi verme. Bilmediğin bir şeyde açıkça tarif verisinde olmadığını söyle.",
      },
      {
        role: "user",
        content: `Tarif bilgileri:\n${buildRecipeContext(recipe)}\n\nKullanıcı sorusu: ${message}`,
      },
    ],
  });

  return response.choices?.[0]?.message?.content?.trim() || null;
};

module.exports = {
  generateRecipeAnswer,
};
