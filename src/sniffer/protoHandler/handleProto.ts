import { DomainEvent } from "@src/interfaces/protoObj/DomainEvent";
import {analyzers} from "./protoAnalyzers";

export const handleProto = (obj: any):DomainEvent => {
    for (let i = 0; i < analyzers.length; i++) {
        const analyzer = analyzers[i];
        if (analyzer.detect(obj)) {
            const result = analyzer.extract(obj);
            if (result) {
                console.log(`✅ ${analyzer.type} detected:`, result);
                return {type: analyzer.type, data: result};
            }
        }
    }
    return null;
}