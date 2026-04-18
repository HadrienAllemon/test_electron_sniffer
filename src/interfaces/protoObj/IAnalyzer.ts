import { ProtoEventType } from "./DomainEvent";

export type IAnalyzer<T> = {
    type: ProtoEventType;
    detect: (obj: any) => boolean;
    extract: (obj: any) => T | null;
}
