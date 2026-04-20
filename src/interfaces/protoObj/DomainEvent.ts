import { IDbItemPrice } from "../dbReady/IDbItemPrice";

export type ProtoEventType = "SALE" | "JHR" | "JDU" | "JCV" | "JER" | "JGD" | "OFFLINE_AUCTION";
export type DomainEvent = { type: "SALE"; data: IDbItemPrice } | { type: ProtoEventType; data: any } | null;

// export type DomainEvent = { type: ProtoEventType; data: any } | null;
