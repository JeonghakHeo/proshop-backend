import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import User from './models/User.js'
import Product from './models/Product.js'
import Order from './models/Order.js'
import users from './data/users.js'
import products from './data/products.js'

dotenv.config()

connectDB()

const importData = async () => {
  try {
    await User.deleteMany()
    await Product.deleteMany()
    await Order.deleteMany()

    const createdUser = await User.insertMany(users)

    const adminUser = createdUser[2]._id

    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser }
    })

    await Product.insertMany(sampleProducts)

    console.log('Data imported..'.green)
    process.exit()
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await User.deleteMany()
    await Product.deleteMany()
    await Order.deleteMany()

    console.log('Data destroyed..'.red)
    process.exit()
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}
