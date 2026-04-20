import { JerMessage } from "@src/interfaces/MessageMap/JerMessage";
import { JhrMessage } from "@src/interfaces/MessageMap/JhrMessage";
import { JcvMessage } from "@src/interfaces/MessageMap/JcvMessage";
import { JgdMessage } from "@src/interfaces/MessageMap/JgdMessage";
import { IDbItemSold } from "@src/interfaces/dbReady/IDbItemSold";
import { IDbItemBought } from "@src/interfaces/dbReady/IDbItemBought";
import { TaxNaturesEnum } from "@src/interfaces/dbReady/TaxNatureEnum";
import { ProtoEventType } from "@src/interfaces/protoObj/DomainEvent";
import { addItemPrice, addItemsBought, addItemsSold, addTax } from "../sqlite/queries";
import appendLogs from "../utls/appendLogs";
import { typeStringDelayed } from "@jitsi/robotjs";
import { IDbItemPrice } from "@src/interfaces/dbReady/IDbItemPrice";

interface AuctionContext {
    lastJduTimestamp: number | null;
    lastSeenTransactionHint: number | null;
}

const auctionContext: AuctionContext = {
    lastJduTimestamp: null,
    lastSeenTransactionHint: null,
};

function decodePackedVarints(buffer: Buffer): number[] {
    const result: number[] = [];
    let i = 0;
    while (i < buffer.length) {
        let value = 0;
        let shift = 0;
        while (true) {
            const byte = buffer[i];
            value |= (byte & 0x7f) << shift;
            if (!(byte & 0x80)) break;
            shift += 7;
            i++;
        }
        result.push(value);
        i++;
    }
    return result;
}

function jerToItemsSold(message: JerMessage): IDbItemSold[] {
    return (message.items ?? []).map(item => ({
        itemId:     item.itemId,
        amountSold: item.amountSold,
        profit:     item.details?.totalGains ?? 0,
    }));
}

export function takeAction(typeName: ProtoEventType, messageContent: any): void {
    switch (typeName) {
        case "SALE": {
            const msg = messageContent as IDbItemPrice;
            addItemPrice(msg);
            
            const suggestedPrice = (msg.by1 - 1).toString();
            typeStringDelayed(suggestedPrice, 3000);
            break;
        }

        case "OFFLINE_AUCTION": {
            const items = messageContent as IDbItemSold[];
            addItemsSold(items);
            break;
        }

        case "JDU": {
            auctionContext.lastJduTimestamp = Date.now();
            auctionContext.lastSeenTransactionHint = messageContent.transactionId;
            break;
        }

        case "JHR": {
            const msg = messageContent as JhrMessage;
            const now = Date.now();
            const isModification = auctionContext.lastJduTimestamp !== null &&
                (now - auctionContext.lastJduTimestamp) < 2000;

            const taxRate  = isModification ? 0.01 : 0.02;
            const taxValue = Math.round(msg.price * taxRate);

            appendLogs(`${isModification ? "Modification" : "Nouvelle mise en vente"} — itemId: ${msg.itemInfo.itemId}, price: ${msg.price}\n\n`);

            addTax([{
                tax_nature: isModification ? TaxNaturesEnum["AuctionNewPrice"] : TaxNaturesEnum["AuctionNewItem"],
                value: taxValue,
            }]);
            break;
        }

        case "JCV": {
            const msg = messageContent as JcvMessage;
            const item: IDbItemBought = {
                itemId:      msg.id,
                amountBought: msg.quantity,
                price:       msg.price,
            };
            addItemsBought([item]);
            break;
        }

        case "JER": {
            const msg = messageContent as JerMessage;
            const itemsSold = jerToItemsSold(msg);
            addItemsSold(itemsSold);
            break;
        }

        // case "JGD": {
           
        // }

        default: {
            appendLogs(`Unrecognized event type: ${typeName}, content: ${JSON.stringify(messageContent)}\n\n`);
        }
    }
}
