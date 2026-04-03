import { JerMessage } from "@src/interfaces/MessageMap/JerMessage";
import { MessageMap } from "../../interfaces/MessageMap";
import { addItemsBought, addItemsSold, addTax } from "../sqlite/queries";
import appendLogs from "../utls/appendLogs";
import { IDbItemSold } from "@src/interfaces/dbReady/IDbItemSold";
import { TaxNaturesEnum } from "@src/interfaces/dbReady/TaxNatureEnum";
import { IDbItemBought } from "@src/interfaces/dbReady/IDbItemBought";

interface AuctionContext {
    lastJduTimestamp: number | null;
    lastSeenTransactionHint: number | null;
}

const auctionContext: AuctionContext = {
    lastJduTimestamp: null,
    lastSeenTransactionHint: null
};

function decodePackedVarints(buffer: Buffer): number[] {
    const result = [];
    let i = 0;

    while (i < buffer.length) {
        let value = 0;
        let shift = 0;

        while (true) {
            const byte = buffer[i];
            value |= (byte & 0x7F) << shift;

            if (!(byte & 0x80)) break;

            shift += 7;
            i++;
        }

        result.push(value);
        i++;
    }

    return result;
}


function flattenOllineItems(message: JerMessage): IDbItemSold[] {
    if (!message?.items) {
        console.log("no items in ", message)
        return [];
    }
    return message.items?.map((item) => (
        {
            itemId: item.itemId,
            amountSold: item.amountSold,
            profit: item.details?.totalGains || 0
        }
    ))
}



export function takeAction<K extends keyof MessageMap>(
    typeName: K,
    messageContent: MessageMap[K],
    base64Data: string,
    buffer: Buffer
): void {
    console.log("Received message of type:", typeName)
    switch (typeName) {
        case "iyc": {
            // chat message
            // console.log("received chat message")
            break
        }
        case "igs": {
            // player map info
            break
        }
        case "iwh": {
            // player map info
            break
        }
        case "jrn": {
            // match found in kolizeum
            break
        }
        case "ipd": {
            // unknown - 
            break
        }
        case "imz": {
            // guild login ? 
        }
        case "jdu": {
            // auction house update - can be used to flag that the player is modifying an item listed
            console.log("Received jdu message, updating lastJduTimestamp to:", Date.now())
            auctionContext.lastJduTimestamp = Date.now();
            auctionContext.lastSeenTransactionHint = messageContent?.transactionId;
            break;
        }
        case "jhr": {
            // This part is a bit messy but I don't have a better idea. 
            // Basically, if the last "jdu" message was received less than 2 seconds ago, we consider that this
            // "jhr" message is a modification of an existing auction item, and not a new listing.
            const now = Date.now();
            const isModification = (now - auctionContext.lastJduTimestamp) < 2000;
            console.log("Received jhr message, isModification:", isModification, "time since last jdu:", now - auctionContext.lastJduTimestamp)

            const taxRate = isModification ? 0.01 : 0.02;

            console.log("Auction:", isModification ? "MODIFICATION" : "NEW");
            appendLogs(`${isModification ? "Modification" : "Nouvelle mise en vente"} d'un item en vente aux enchères : ${JSON.stringify(messageContent)}\n\n`);

            if (messageContent?.price) {
                const taxValue = -Math.round(-(messageContent.price * taxRate));
                addTax([{
                    tax_nature: isModification
                        ? TaxNaturesEnum["AuctionNewPrice"]
                        : TaxNaturesEnum["AuctionNewItem"],
                    value: taxValue
                }]);
            }

            break;
        }
        case "jcv": {
            console.log("Achat :", messageContent, base64Data)
            const itemBought: IDbItemBought = {
                itemId: messageContent["id"],
                price: messageContent["price"],
                amountBought: messageContent["quantity"]
            }
            // const taxValue = -Math.round(-(messageContent as any).priceSet / 100 * 2)
            addItemsBought([itemBought])
            break
        }


        case "jer": {
            // auction sell - OFFLINE -
            const offlineItems = messageContent;
            const itemsSold = flattenOllineItems(offlineItems);
            console.log("OFFLINE AUCTION", itemsSold.length);
            addItemsSold(itemsSold);
            break
        }

        case "ien": {
            // chat msg
            break
        }

        case 'jgj': {
            // ITEMS CURRENTLY LISTED IN AUCTION
            break
        }

        case "jgd": {
            // Auction Price checking
            if (messageContent?.auctionInfo?.pricesBytes) {
                const raw = Buffer.from(messageContent.auctionInfo.pricesBytes, "hex");
                const prices = decodePackedVarints(raw);
                console.log("FOUND PRICES", prices);
            }
        }


        default: {
            appendLogs(`Unknown message type: ${typeName}, content: ${JSON.stringify(messageContent)}\n\n`)
            // console.log("Unknown message type:", typeName, messageContent)
        }
    }
}