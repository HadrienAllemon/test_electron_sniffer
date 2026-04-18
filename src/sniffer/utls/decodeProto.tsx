export function decodeProto(buffer: Buffer, offset = 0, end = buffer.length): any {
    const result: any = {};

    while (offset < end) {
        const [tag, tagLen] = readVarint(buffer, offset);
        offset += tagLen;

        const fieldNumber = tag >> 3;
        const wireType = tag & 0x7;

        let value: any;

        if (wireType === 0) {
            const [v, len] = readVarint(buffer, offset);
            value = v;
            offset += len;
        }

        else if (wireType === 2) {
            const [len, lenLen] = readVarint(buffer, offset);
            offset += lenLen;

            const subBuffer = buffer.slice(offset, offset + len);

            const decoded = decodeProto(subBuffer);
            const packed = tryDecodePackedVarints(subBuffer);
            const str = tryDecodeUtf8(subBuffer);


            if (packed && isLikelyPriceArray(packed)) {
                value = packed;
            } else if (Object.keys(decoded).length > 0) {
                value = decoded;
            } else if (str !== null) {
                value = str;
            }

            offset += len;
        } else {
            break
        }

        if (!result[fieldNumber]) {
            result[fieldNumber] = value;
        } else if (Array.isArray(result[fieldNumber])) {
            result[fieldNumber].push(value);
        } else {
            result[fieldNumber] = [result[fieldNumber], value];
        }
    }

    return result;
}

function readVarint(buffer: Buffer, offset: number): [number, number] {
    let result = 0;
    let shift = 0;
    let pos = offset;

    while (true) {
        const byte = buffer[pos];
        result |= (byte & 0x7f) << shift;

        if ((byte & 0x80) === 0) break;

        shift += 7;
        pos++;
    }

    return [result, pos - offset + 1];
}

function tryDecodeUtf8(buffer: Buffer): string | null {
    if (buffer.length === 0) return null;
    // Only treat as a string if all bytes are printable ASCII — high bytes (> 0x7E)
    // appear in both packed varint sequences and proto sub-messages, so they're
    // ambiguous and should fall through to the packed-varints path.
    if (!buffer.every(b => b >= 0x20 && b <= 0x7E)) return null;
    return buffer.toString('utf8');
}

// Returns null if the buffer doesn't cleanly decode as packed varints
// (i.e. last varint's MSB continuation bit would read past the buffer).
function tryDecodePackedVarints(buffer: Buffer): number[] | null {
    const result: number[] = [];
    let offset = 0;

    while (offset < buffer.length) {
        if (buffer[offset] === undefined) return null;
        const [value, len] = readVarint(buffer, offset);
        // If readVarint would have read past the buffer, bail out
        if (offset + len > buffer.length) return null;
        result.push(value);
        offset += len;
    }

    return result;
}

function isLikelyPriceArray(values: number[]): boolean {
    const hasNegative = values.some(v => v < 0);
    if (hasNegative) return false;
    if (values.length === 1) return values[0] > 0;

    if (values.length >= 2 && values.length <= 4) {
        return values[0] > 0 && values[1] >= values[0];
    }
    // * for bigger arrays, it needs to let through items with lots of prices listed
    // * But to prevent an object to be misinterpreted as an array. 
    // * Best solution would be to check the first l - 1 values are in ascending order, and the last one is much bigger than the first one.
    if (values.length >= 5) {
        const positives = values.filter(v => v > 0);
        let lastValue = 0;
        let firstValue = positives[0];

        if (!values.some(v => v > firstValue)) return false;
        for (const v of positives) {
            if (v < lastValue) return false;
            lastValue = v;
        }
        return true
    }

    return false;
}