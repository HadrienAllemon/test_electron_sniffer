import { IItemBought, IItemSold, ITransaction } from './interfaces';

declare global {
    interface Window {
        api: {
            getItemsBought: () => Promise<IItemBought[]>;
            getItemsSold: () => Promise<IItemSold[]>;
            getTransactions: () => Promise<ITransaction[]>;
        };
    }
}
