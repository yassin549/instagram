import { createMocks } from 'node-mocks-http'
import handler from '../products'
import { getDb } from '../../../lib/db'

// Mock the getDb function
jest.mock('../../../lib/db', () => ({
  getDb: jest.fn(),
}))

describe('/api/products', () => {
  let mockDb

  beforeEach(() => {
    // Reset mocks and setup the mock db before each test
    jest.clearAllMocks()
    mockDb = {
      data: {
        products: [{ id: '1', name: 'Aura Sphere' }],
        users: [],
        orders: [],
      },
      write: jest.fn(),
    }
    ;(getDb as jest.Mock).mockResolvedValue(mockDb)
  })

  it('GET /api/products should return all products', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const responseData = res._getJSONData()
    expect(responseData).toHaveLength(1)
    expect(responseData[0].name).toBe('Aura Sphere')
  })

  it('POST /api/products should create a new product', async () => {
    const newProductData = {
      name: 'Test Product',
      description: 'A product for testing',
      price: 99.99,
      images: ['/images/products/test.jpg'],
      category: 'Test Category',
      size: 'M',
      stock: 10,
    }
    const { req, res } = createMocks({ method: 'POST', body: newProductData })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const createdProduct = res._getJSONData()
    expect(createdProduct.name).toBe(newProductData.name)
    expect(mockDb.data.products.length).toBe(2)
    expect(mockDb.write).toHaveBeenCalledTimes(1)
  })

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks({ method: 'DELETE' })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(405)
  })
})
