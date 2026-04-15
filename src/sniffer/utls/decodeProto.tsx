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
        
            // Try protobuf decode
            const decoded = decodeProto(subBuffer);
        
            if (Object.keys(decoded).length > 0) {
                value = decoded;
            } else {
                // Try packed varints
                const packed = decodePackedVarints(subBuffer);
        
                if (packed.length > 1) {
                    value = packed; // 🎯 this is your prices
                } else {
                    value = subBuffer; // fallback
                }
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

function decodePackedVarints(buffer: Buffer): number[] {
    const result: number[] = [];
    let offset = 0;

    while (offset < buffer.length) {
        const [value, len] = readVarint(buffer, offset);
        result.push(value);
        offset += len;
    }

    return result;
}