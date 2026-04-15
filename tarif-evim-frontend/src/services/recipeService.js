import { apiClient } from "./apiClient";

let cachedRecipes = [];

const categoryUiToApi = {
  "Diyet": "diet",
  "Vegan": "vegan",
  "Glutensiz kategori": "gluten-free",
  "Glütensiz": "gluten-free",
  "Tatlı": "dessert",
  "Atıştırmalık ve Tatlı": "dessert",
  "Kahvaltı": "breakfast",
  "Öğle Yemeği": "lunch",
  "Akşam Yemeği": "dinner",
};

const categoryApiToUi = {
  "diet": "Diyet",
  "vegan": "Vegan",
  "gluten-free": "Glütensiz",
  "keto": "Diyet",
  "general": "Genel",
  "breakfast": "Kahvaltı",
  "lunch": "Öğle Yemeği",
  "dinner": "Akşam Yemeği",
  "dessert": "Tatlı",
};

const ingredientRegex = /^(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)\s+(.*)$/;

const normalizeIngredients = (ingredients = []) =>
  ingredients
    .map((item) => {
      const name = String(item?.name || "").trim();
      const amount = String(item?.amount || "").trim();
      return amount ? `${amount} ${name}`.trim() : name;
    })
    .filter(Boolean);

const normalizeRecipe = (recipe) => ({
  id: recipe.recipeNo,
  recipeNo: recipe.recipeNo,
  title: recipe.title,
  description: recipe.description || "",
  image:
    recipe.image ||
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
  calories: Number(recipe.calories || 0),
  servings: Number(recipe.servings || 1),
  category: categoryApiToUi[recipe.category] || recipe.category || "Genel",
  dietitianApproved: Boolean(recipe.isApproved),
  ingredients: normalizeIngredients(recipe.ingredients),
  steps: Array.isArray(recipe.steps) ? recipe.steps : [],
  ratingAverage: Number(recipe.ratingAverage || 0),
  ratingCount: Number(recipe.ratingCount || 0),
});

const toCreatePayload = (recipeInput) => ({
  title: String(recipeInput.title || "").trim(),
  description: String(recipeInput.description || "").trim(),
  category: categoryUiToApi[recipeInput.category] || "general",
  calories: Number(recipeInput.calories || 0),
  servings: Number(recipeInput.servings || 1),
  image: String(recipeInput.image || "").trim() || null,
  ingredients: (recipeInput.ingredients || [])
    .map((raw) => {
      const value = String(raw || "").trim();
      if (!value) return null;
      const match = value.match(ingredientRegex);
      if (!match) return { name: value, amount: "" };
      return { amount: match[1], name: match[2] };
    })
    .filter(Boolean),
  steps: (recipeInput.steps || []).map((step) => String(step).trim()).filter(Boolean),
});

const setCache = (list) => {
  cachedRecipes = list;
  return list;
};

export const RECIPES = cachedRecipes;

export const getRecipes = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (typeof params.onlyApproved !== "undefined") {
    query.set("onlyApproved", String(params.onlyApproved));
  }
  if (params.limit) query.set("limit", String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiClient.get(`/recipes${suffix}`);
  return setCache((response?.data || []).map(normalizeRecipe));
};

export const getPopularRecipes = async () => {
  const response = await apiClient.get("/recipes/popular");
  return (response?.data || []).map(normalizeRecipe);
};

export const getRecipeById = async (id) => {
  const response = await apiClient.get(`/recipes/${id}`);
  const normalized = response?.data ? normalizeRecipe(response.data) : null;
  if (!normalized) return null;

  const exists = cachedRecipes.some((recipe) => recipe.id === normalized.id);
  if (!exists) {
    cachedRecipes = [...cachedRecipes, normalized];
  }
  return normalized;
};

export const searchRecipes = async (query) => {
  const term = String(query || "").trim();
  if (!term) return [];
  return getRecipes({ q: term, onlyApproved: true, limit: 20 });
};

export const createRecipe = async (recipeInput) => {
  const response = await apiClient.post("/recipes", toCreatePayload(recipeInput), { auth: true });
  return normalizeRecipe(response?.data || {});
};

export const rateRecipe = async (recipeId, score) => {
  const response = await apiClient.post(`/recipes/${recipeId}/rate`, { score }, { auth: true });
  return response?.data || { ratingAverage: 0, ratingCount: 0 };
};

export const chatAboutRecipe = async (recipeId, message) => {
  const response = await apiClient.post(`/recipes/${recipeId}/chat`, { message }, { auth: true });
  return response?.data?.answer || "";
};
