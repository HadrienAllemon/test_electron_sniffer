import { itemIdSet } from '../sqlite/queries';
import { decodeProto } from '../utls/decodeProto';
import { handleProto } from '../protoHandler/handleProto';
import { jhoExample } from '../messagesExamples/jhoExample';

beforeAll(() => {
  // Seed the two item IDs present in the example message
  itemIdSet.add(2540);
  itemIdSet.add(15533);
});

describe('jho message → OFFLINE_AUCTION', () => {
  it('decodes the protobuf buffer without error', () => {
    const buffer = Buffer.from(jhoExample.content, 'base64');
    const decoded = decodeProto(buffer);
    expect(decoded).toBeDefined();
    expect(typeof decoded).toBe('object');
  });

  it('classifies the message as OFFLINE_AUCTION with correct items', () => {
    const buffer = Buffer.from(jhoExample.content, 'base64');
    const decoded = decodeProto(buffer);
    const event = handleProto(decoded);

    expect(event).not.toBeNull();
    expect(event.type).toBe('OFFLINE_AUCTION');
    expect(event.data).toEqual([
      { itemId: 2540,  amountSold: 1, profit: 2099  },
      { itemId: 15533, amountSold: 1, profit: 15787 },
      { itemId: 2540,  amountSold: 1, profit: 2099  },
      { itemId: 2540,  amountSold: 1, profit: 2099  },
      { itemId: 15533, amountSold: 1, profit: 15787 },
      { itemId: 15533, amountSold: 1, profit: 15787 },
      { itemId: 15533, amountSold: 1, profit: 15787 },
      { itemId: 15533, amountSold: 1, profit: 15787 },
    ]);
  });
});
