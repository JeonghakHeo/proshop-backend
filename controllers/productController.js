import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'

//  @route    GET /api/products
//  @desc     Fetch all products
//  @access   Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 4
  const page = Number(req.query.pageNumber) || 1

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {}

  const total = await Product.countDocuments({ ...keyword })
  if (total === 0) {
    const countAll = await Product.countDocuments({})
    const products = await Product.find({})
      .limit(pageSize)
      .skip(pageSize * (page - 1))
    res.json({
      message: 'no product found for the keyword, so we return all result',
      products,
      page,
      pages: Math.ceil(countAll / pageSize),
    })
    return
  }
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))

  res.json({ products, page, pages: Math.ceil(total / pageSize) })
})

//  @route    GET /api/products/:id
//  @desc     Fetch single product
//  @access   Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  res.json(product)
})

//  @route    DELETE /api/products/:id
//  @desc     Delete a product
//  @access   Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    await product.remove()

    res.json({ msg: 'Product deleted' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

//  @route    POST /api/products
//  @desc     Create a product
//  @access   Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    user: req.user._id,
    name: 'Sample product',
    brand: 'Sample brand',
    category: 'Sample category',
    description: 'Sample description',
    price: 0,
    countInStock: 0,
    numReviews: 0,
    image: '/images/sample.jpg',
  })

  const createdProduct = await product.save()
  res.status(201).json(createdProduct)
})

//  @route    PUT /api/products/:id
//  @desc     Update a product
//  @access   Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, brand, category, description, price, image, countInStock } =
    req.body

  const product = await Product.findById(req.params.id)

  if (product) {
    ;(product.name = name),
      (product.brand = brand),
      (product.category = category),
      (product.description = description),
      (product.price = price),
      (product.image = image),
      (product.countInStock = countInStock)

    const updatedProduct = await product.save()
    res.status(201).json(updatedProduct)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

//  @route    POST /api/products/:id/reviews
//  @desc     Create new review
//  @access   Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  const product = await Product.findById(req.params.id)

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    )

    if (alreadyReviewed) {
      res.status(400)
      throw new Error('Product already reviewed')
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    }

    product.reviews.push(review)

    product.numReviews = product.reviews.length

    product.rating =
      product.reviews.reduce((acc, review) => review.rating + acc, 0) /
      product.reviews.length

    await product.save()
    res.status(201).json({ message: 'Review added' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

//  @route    GET /api/products/top
//  @desc     Get top rated products
//  @access   Public
export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3)

  res.json(products)
})
