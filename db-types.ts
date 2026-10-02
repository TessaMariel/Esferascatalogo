// Auto-generated from your database schema — do not edit by hand.
// Regenerates automatically whenever a table is created or altered.

export type OrnamentsRow = {
  id: string
  name: string
  category: string
  price: number | string
  imageUrl: string
  color: string
  description: string
  featured: boolean
  createdAt: string
}

export type ReservationsRow = {
  id: string
  userId: string
  customerName: string
  contact: string
  scene: string
  ornamentIds: string
  total: number | string
  status: string
  createdAt: string
}
