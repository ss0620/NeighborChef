export interface RawIngredientAmount {
  name: string;
  unit: string | null;
  quantity: number | null;
  scale: number;
}

export interface AggregatedIngredient {
  key: string;
  name: string;
  unit: string | null;
  quantity: number | null; // null if any contributing ingredient had no quantity ("to taste")
}

function normalizeKey(name: string, unit: string | null): string {
  return `${name.trim().toLowerCase()}|${(unit ?? '').trim().toLowerCase()}`;
}

/** Aggregates ingredient amounts across recipes by normalized (name, unit), scaling each by its recipe's servings ratio. */
export function aggregateIngredients(amounts: RawIngredientAmount[]): AggregatedIngredient[] {
  const byKey = new Map<string, AggregatedIngredient>();

  for (const amount of amounts) {
    const key = normalizeKey(amount.name, amount.unit);
    const existing = byKey.get(key);
    const scaledQuantity = amount.quantity != null ? amount.quantity * amount.scale : null;

    if (!existing) {
      byKey.set(key, { key, name: amount.name.trim(), unit: amount.unit, quantity: scaledQuantity });
      continue;
    }

    existing.quantity =
      existing.quantity != null && scaledQuantity != null ? existing.quantity + scaledQuantity : null;
  }

  return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name));
}
