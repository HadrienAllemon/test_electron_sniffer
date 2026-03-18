import protobuf from 'protobufjs';
import { handlePacket } from './handlePacket';
import { Cap } from './decoders';
import { networkInterfaces } from "os";


const DEVICE_IP = '192.168.0.101';
const CAPTURE_FILTER = 'tcp port 5555';
const BUF_SIZE = 10 * 1024 * 1024; // 10MB ring buffer
const PACKET_SIZE = 65535;          // Max Ethernet frame size

function getInterfaces(): Record<string, string> {
    const nets = networkInterfaces();
    const result: Record<string, string> = {};

    for (const [name, infos] of Object.entries(nets)) {
        if (!infos) continue;
        const ipv4 = infos.find(i => i.family === "IPv4");
        if (ipv4) result[name] = ipv4.address;
    }

    return result;
}

const startSniffing = (lookupType: protobuf.Type): void => {
    try {
        const buffer = Buffer.alloc(PACKET_SIZE);
        const interfaces = getInterfaces();
        const device = Cap.findDevice(Object.values(interfaces)[0]);
        // const device = Cap.findDevice(DEVICE_IP);
        const cap = new Cap();

        cap.open(device, CAPTURE_FILTER, BUF_SIZE, buffer);
        cap.setMinBytes?.(0);

        console.log(`Sniffing on ${device} (${DEVICE_IP}) — filter: "${CAPTURE_FILTER}"`);

        cap.on('packet', (nbytes: number, trunc: boolean) => {
            handlePacket(nbytes, trunc, buffer, lookupType);
        });
    } catch (e) {
        console.error('Error during network sniffing:', e);
        process.exit(1);
    }
};

export default startSniffing;