import { networkInterfaces } from 'os';
import { readableInterface } from '../types/interfaces.type';
import { handlePacket } from './handlePacket';
import { Cap } from "./decoders"


const getReadableInterfaces = () => {
    const interfaces: readableInterface = {};
    const nets = networkInterfaces();

    for (const [name, info] of Object.entries(nets)) {
        if (info) {
            const iface = info[0];
            interfaces[name] = iface.address;
        }
    }

    return interfaces
}

const startSniffing = (lookupType: protobuf.Type) => {
    try {
        const interfaces = getReadableInterfaces();
        const cap = new Cap();
        const bufSize = 10 * 1024 * 1024; // 10MB buffer
        const buffer = Buffer.alloc(65535); // Maximum packet size
        const device = Cap.findDevice('192.168.0.101')
        cap.open(device, 'tcp port 5555', bufSize, buffer);
        cap.setMinBytes && cap.setMinBytes(0);
        console.log("STARTED SNIFFING")
        cap.on('packet', (nbytes: any, trunc: any) => {
            handlePacket(nbytes, trunc, buffer, lookupType)
        });
        // if (Object.keys(interfaces).length === 0) {
        //     console.log("No network interfaces found");
        //     return;
        // }

        // console.log("Available interfaces:");
        // for (const [name, address] of Object.entries(interfaces)) {
        //     console.log(`- ${name} (${address})`);
        // }

        // console.log("\nStarting packet capture... Press Ctrl+C to stop");

        // const c = new Cap();
        // const bufSize = 10 * 1024 * 1024; // 10MB buffer
        // const buffer = Buffer.alloc(65535); // Maximum packet size

        // c.open(Cap.findDevice('192.168.1.168'), 'tcp port 5555', bufSize, buffer);
        // c.setMinBytes && c.setMinBytes(0);

        // c.on('packet', (nbytes, trunc) => {
        //     handlePacket(nbytes, trunc, buffer);
        // });
    } catch (e) {
        console.error("Error during network sniffing:", e);
        process.exit(1);
    }
}

export default startSniffing