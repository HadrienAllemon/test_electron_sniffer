import { IDbItemPrice } from "../dbReady/IDbItemPrice";
import { ProtoEventType } from "./DomainEvent";

export type ISaleAnalyzer = {
    type: ProtoEventType,
    detect: (obj: any) => boolean,
    extract: (obj: any) => IDbItemPrice | null,
}