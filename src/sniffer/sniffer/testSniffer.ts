import { networkInterfaces } from "os";
import { handlePacket } from "./handlePacket";
import { Cap } from "./decoders";
import protobuf from "protobufjs";

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

export default function startSniffing(lookupType: protobuf.Type) {
    const interfaces = getInterfaces();
    console.log(interfaces)

    if (Object.keys(interfaces).length === 0) {
        throw new Error("No network interfaces found");
    }

    const device = Cap.findDevice(Object.values(interfaces)[0]);
    if (!device) {
        throw new Error("No capture device found");
    }

    const cap = new Cap();
    const buffer = Buffer.alloc(65535);

    cap.open(device, "tcp port 5555", 10 * 1024 * 1024, buffer);
    cap.setMinBytes?.(0);

    console.log(`Sniffing on ${device}...`);

    cap.on("packet", (nbytes: number, trunc: boolean) => {
        handlePacket(nbytes, trunc, buffer, lookupType);
    });
}