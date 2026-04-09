export interface JgdMessage {
    auctionInfo: JgdItemAuctionInfo[];
    itemId: number;
}
interface JgdItemAuctionInfo {
    pricesBytes: Buffer;
}