
// difference between type and interface
// interface vs type
// - type can alias anything: unions, primitives, computed types
// - interface can only describe object shapes
// - duplicate interfaces merge; duplicate types error
// Object shapes: either works.

export interface Product {
    category: string;
    price: number;
    stocked: boolean;
    name: string;
}

export const products: Product[] = [
    { category: "Fruits", price: 32, stocked: true, name: "Apple" },
    { category: "Fruits", price: 22, stocked: true, name: "Dragonfruit" },
    { category: "Fruits", price: 2, stocked: false, name: "Passion fruit" },
    { category: "Vegetables", price: 2, stocked: true, name: "Spinach" },
    { category: "Vegetables", price: 23, stocked: false, name: "Pumpkin" },
    { category: "Vegetables", price: 32, stocked: true, name: "Peas" }
]