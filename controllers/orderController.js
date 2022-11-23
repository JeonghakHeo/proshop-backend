import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'

//  @route    POST /api/orders
//  @desc     Create new orders
//  @access   Private
export const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = req.body

  if (orderItems && orderItems.length === 0) {
    res.status(400)
    throw new Error('No order items')
    return
  } else {
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    })

    const createdOrder = await order.save()

    res.status(201).json(createdOrder)
  }
})

//  @route    GET /api/orders/:id
//  @desc     Get order by ID
//  @access   Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  )

  if (order) {
    res.json(order)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

//  @route    PUT /api/orders/:id/pay
//  @desc     Update order to paid
//  @access   Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    ;(order.isPaid = true),
      (order.paidAt = Date.now()),
      (order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      })

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @route   PUT /api/orders/:id/sent
// @desc    Update order to sent
// @access  Private/Admin
export const updateOrderToSent = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isSent = true
    order.sentAt = Date.now()

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isDelivered = true
    order.deliveredAt = Date.now()

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

//  @route    GET /api/orders/myorders
//  @desc     Get logged in user orders
//  @access   Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const order = await Order.find({ user: req.user._id })

  res.json(order)
})

//  @route    GET /api/orders
//  @desc     Get all orders
//  @access   Private/Admmin
export const getOrders = asyncHandler(async (req, res) => {
  const order = await Order.find({}).populate('user', 'id name')

  res.json(order)
})
