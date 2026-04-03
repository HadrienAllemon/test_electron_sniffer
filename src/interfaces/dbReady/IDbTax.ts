import { TaxNaturesEnum } from "./TaxNatureEnum";

export type IDbTax = {
    id?: number
    tax_nature: TaxNaturesEnum,
    value: number
}