import { IDbItemPrice } from "../dbReady/IDbItemPrice";

export type ProtoEventType = "SALE";
export type DomainEvent =  { type: ProtoEventType; data: IDbItemPrice }
