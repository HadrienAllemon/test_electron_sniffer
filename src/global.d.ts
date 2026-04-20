import { IItemBought, IItemSold, ITransaction } from './interfaces';
import { IPetItemXpRatio, IItemSearchResult } from './sniffer/sqlite/queries';

declare global {
    interface Window {
        api: {
            getItemsBought: () => Promise<IItemBought[]>;
            getItemsSold: () => Promise<IItemSold[]>;
            getTransactions: () => Promise<ITransaction[]>;
            getPetItemXpRatios: () => Promise<IPetItemXpRatio[]>;
            onPricesUpdated: (callback: () => void) => void;
            searchItems: (query: string) => Promise<IItemSearchResult[]>;
            addPetItemXp: (itemId: number, xp: number) => Promise<void>;
        };
    }
}
