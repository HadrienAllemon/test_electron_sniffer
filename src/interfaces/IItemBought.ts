export interface IItemBought {
    id: number;
    itemId: number;
    fr:string // name of item in french
    amountBought: number;
    price: number;
    created_at: string; // ISO datetime string from SQLite
    iconId:number;
  }