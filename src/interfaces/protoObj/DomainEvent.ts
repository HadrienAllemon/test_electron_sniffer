import { IDbItemPrice } from "../dbReady/IDbItemPrice";

export type ProtoEventType = "PRICE" | "PRICE_UPDATE" | "JHR" | "JDU" | "JCV" | "JER" | "JGD" | "OFFLINE_AUCTION";
export type DomainEvent = { type: "PRICE"; data: IDbItemPrice } | { type: "PRICE_UPDATE"; data: IDbItemPrice } | { type: ProtoEventType; data: any } | null;

// export type DomainEvent = { type: ProtoEventType; data: any } | null;
