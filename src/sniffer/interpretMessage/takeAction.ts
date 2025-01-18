import { addItemsBought, addItemsSold, addTax } from "../sqlite/queries";

type offlineItemsSold = {
    items: offlineItemSold[];
}

type offlineItemSold = {
    itemId: number;
    amountSold: number;
    details: {
        totalGains: number
    }
}

export type itemSold = {
    itemId: taxNatures,
    amountSold: number,
    profit: number
}

export type itemBought = {
    itemId: taxNatures,
    amountBought: number,
    price: number
}

export type tax = {
    id?: number
    tax_nature: number,
    value: number
}

enum taxNatures {
    "AuctionNewItem" = 1,
    "AuctionNewPrice" = 2
}

function flattenOllineItems(message: offlineItemsSold): itemSold[] {
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
    // return {
    //     itemId: item.itemId,
    //     amountSold: item.amountSold,
    //     totalGains: item.details?.totalGains || null, // Extract `totalGains` if `details` exists
    // };
}

export const takeAction = (typeName: string, messageContent: object, base64Data: string, buffer: any) => {
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
            // mise en vente
            console.log("Mise en vente : ", messageContent, base64Data)
            break
        }
        case "imz": {
            // mise en vente
            const taxValue = -Math.round(-(messageContent as any).priceSet / 100 * 2)
            addTax([{ tax_nature: taxNatures["AuctionNewItem"], value: taxValue }])
            break
        }
        case "ina": {
            // mise en vente
            const taxValue = -Math.round(-(messageContent as any).priceSet / 100 * 1)
            addTax([{ tax_nature: taxNatures["AuctionNewPrice"], value: taxValue }])

            break
        }
        case "jpx": {
            const rawValueBytes = Buffer.from(base64Data, 'base64');
            const field2Length = buffer[2]; // Length of the first item value
            const itemValue1 = rawValueBytes.slice(3, 3 + field2Length).toString('utf-8'); // Extract ASCII
            const allValuesItem1 = itemValue1.split(/[^0-9]/).filter(a => a.length)

            const field1Length = buffer[1]
            const itemValue2 = rawValueBytes.slice(3, 3 + field1Length).toString('utf-8'); // Extract ASCII
            const allValuesItem2 = itemValue2.split(/[^0-9]/).filter(a => a.length)

            if (allValuesItem1.length === 4 && allValuesItem1.every(str => str.match(/[1-9]/))) {
                const itemSold: itemSold = {
                    itemId: +allValuesItem1[1],
                    profit: +allValuesItem1[0],
                    amountSold: +allValuesItem1[3]
                }
                console.log("adding item to db : ", itemSold, allValuesItem1)
                addItemsSold([itemSold])
            } else if (allValuesItem2.length === 4 && allValuesItem2.every(str => str.match(/[1-9]/))) {
                const itemBought: itemBought = {
                    itemId: +allValuesItem2[0],
                    price: +allValuesItem2[3],
                    amountBought: +allValuesItem2[2]
                }
                console.log("adding item to db : ", itemBought, allValuesItem2)
                addItemsBought([itemBought])
            }
            break
        }
        case "ipl": {
            // auction sell - OFFLINE -
            const offlineItems = messageContent as offlineItemsSold
            const itemsSold = flattenOllineItems(offlineItems)
            console.log("OFFLINE AUCTION", itemsSold.length)
            addItemsSold(itemsSold)
            break
        }
    }
}