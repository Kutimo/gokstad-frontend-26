export interface Product {
  category: string
  price: number
  stocked: boolean
  name: string
}

export const products = [
  { category: "Fruits", price: 22, stocked: true, name: "Apple" },
  { category: "Fruits", price: 33, stocked: true, name: "Dragonfruit" },
  { category: "Fruits", price: 22, stocked: false, name: "Passionfruit" },
  { category: "Vegetables", price: 54, stocked: true, name: "Spinach" },
  { category: "Vegetables", price: 66, stocked: false, name: "Pumpkin" },
  { category: "Grains", price: 55, stocked: false, name: "Rice" },
]
