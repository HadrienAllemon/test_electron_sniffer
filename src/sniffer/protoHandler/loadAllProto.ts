import fs from "fs";
import path from "path";
import protobuf from "protobufjs";

export const protoCache = new Map<string, protobuf.Type>();

export function loadAllProtos(protoDir: string) {
    const files = fs.readdirSync(protoDir);

    for (const file of files) {
        if (!file.endsWith(".proto")) continue;

        const typeName = path.basename(file, ".proto");

        try {
            const root = protobuf.loadSync(path.join(protoDir, file));
            const type = root.lookupType(
                `com.ankama.dofus.server.game.protocol.${typeName}`
            );

            protoCache.set(typeName, type);
        } catch (err) {
            console.warn(`Failed to load proto ${file}`, err);
        }
    }

    console.log(`Loaded ${protoCache.size} proto types`);
}