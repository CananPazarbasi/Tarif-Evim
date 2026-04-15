import { apiClient } from "./apiClient";

const normalizeItem = (item) => ({
  id: String(item._id || item.id || ""),
  name: String(item.name || ""),
  quantity: String(item.quantity || ""),
  checked: Boolean(item.checked),
});

const normalizeList = (items = []) =>
  items.map(normalizeItem).filter((item) => item.id && item.name);

export const getShoppingList = async () => {
  const response = await apiClient.get("/users/shopping-list", { auth: true });
  return normalizeList(response?.data || []);
};

export const addShoppingItem = async ({ name, quantity = "" }) => {
  const response = await apiClient.post(
    "/users/shopping-list",
    { name: String(name || "").trim(), quantity: String(quantity || "").trim() },
    { auth: true },
  );
  return normalizeList(response?.data || []);
};

export const updateShoppingItem = async (itemId, patch) => {
  const response = await apiClient.put(`/users/shopping-list/${itemId}`, patch, { auth: true });
  return normalizeList(response?.data || []);
};

export const removeShoppingItem = async (itemId) => {
  const response = await apiClient.delete(`/users/shopping-list/${itemId}`, { auth: true });
  return normalizeList(response?.data || []);
};

export const clearShoppingList = async () => {
  await apiClient.delete("/users/shopping-list", { auth: true });
  return [];
};
