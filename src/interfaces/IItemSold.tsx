export interface IItemSold {
    id: number;
    item_id: number;
    fr:string // name of item in french
    amountSold: number;
    profit: number;
    created_at: string; // ISO datetime string from SQLite
    iconId:number;
  }