import crypto from 'crypto'
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import sendEmail from '../utils/sendEmail.js'
//  @route    POST /api/users/login
//  @desc     Auth user & get token
//  @access   Public
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

//  @route    POST /api/users
//  @desc     Register a new user
//  @access   Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
  })

  if (user) {
    res.status(201)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid user data')
  }
})

//  @route    GET /api/users/profile
//  @desc     Get user profile
//  @access   Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

//  @route    PUT /api/users/profile
//  @desc     Update user profile
//  @access   Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

//  @route    GET /api/users
//  @desc     Get all users
//  @access   Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ name: 'asc' })

  res.json(users)
})

//  @route    DELETE /api/users/:id
//  @desc     Delete users
//  @access   Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    await user.remove()
    res.json({ message: 'user removed' })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
  res.json(users)
})

//  @route    GET /api/users/:id
//  @desc     Get user by ID
//  @access   Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

//  @route    PUT /api/users/:id
//  @desc     Update user
//  @access   Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.isAdmin = req.body.isAdmin

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @route   POST /api/users/forgotpassword
// @desc    Create a password reset token
// @access  Public
export const createResetToken = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    res.status(404)
    throw new Error(
      'Sorry, we could not find the email. Please try with a correct email again.'
    )
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: true })

  // Create reset Url
  const resetUrl = `https://proshop-mern-0302.herokuapp.com/resetpassword/${resetToken}`

  const message = `Hi ${user.name}, \n\n You are receiving this email because you have requested the reset of password. \n Click on this link to create a new password: \n\n ${resetUrl} \n\n If you didn't request a password reset, you can igonore this email. Your password will not be changed. \n\n PROSHOP Team`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    })

    res.status(200).json({ success: true, data: resetToken })
  } catch (error) {
    console.log(error)

    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    res.status(500)
    throw new Error('Email could not be sent')
  }
})

// @route   POST /api/users/forgotpassword/check
// @desc    Check reset token
// @access  Public
export const checkResetToken = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.body

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!resetToken) {
    res.status(404)
    throw new Error('Please enter the verification code.')
  } else if (!user) {
    res.status(400)
    throw new Error('Sorry, the verification code is not correct or expired.')
  }

  res.status(200).json({ verified: true })
})

// @route   PUT /api/users/resetpassword
// @desc    Reset password
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body

  const user = await User.findOne({
    email,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    res.status(400)
    throw new Error('Invalid token')
  }

  user.password = newPassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  res.status(200).json({ success: 'Password reset' })
})
