export interface IItemSold {
    id?: number;
    itemId: number;
    fr:string // name of item in french
    amountSold: number;
    profit: number;
    created_at: string; // ISO datetime string from SQLite
    iconId:number;
  }