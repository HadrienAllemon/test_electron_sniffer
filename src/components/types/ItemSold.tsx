export interface ItemSoldRow {
    id: number;
    item_id: number;
    amountSold: number;
    profit: number;
    created_at: string; // ISO datetime string from SQLite
  }