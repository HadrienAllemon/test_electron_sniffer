export interface ITax {
    id: number;
    tax_nature: number;
    value:  number;
    created_at: string; // ISO datetime string from SQLite
}