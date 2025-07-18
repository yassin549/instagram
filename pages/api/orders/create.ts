import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { Order } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface OrderRequest extends NextApiRequest {
  body: {
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
    shippingAddress: {
      fullName: string
      address: string
      city: string
      postalCode: string
      country: string
    }
    total: number
  }
}

export default async function handler(req: OrderRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { items, shippingAddress, total } = req.body

    // Basic validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' })
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.address
    ) {
      return res.status(400).json({ error: 'Invalid shipping address' })
    }

    // Generate order ID
    const orderId = uuidv4()

    // Create order
    const order: Order = {
      id: orderId,
      items,
      shippingAddress,
      total,
      status: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentMethod: 'cash_on_delivery',
    }

    // Save order to database
    await db.orders.push(order)
    await db.write()

    // Update product stock
    for (const item of items) {
      const productIndex = db.products.findIndex(p => p.id === item.productId)
      if (productIndex !== -1) {
        db.products[productIndex].stock =
          db.products[productIndex].stock - item.quantity
      }
    }
    await db.write()

    res.status(201).json({ order })
  } catch (error) {
    console.error('Order creation error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
}
