import mongoose from 'mongoose'
import colors from 'colors'

const connectDB = async () => {
  const connection = await mongoose.connect(process.env.MONGO_URI)
  console.log(
    `MongoDB Connected: ${connection.connection.host}/${process.env.DB_NAME}`
      .cyan.underline.bold
  )
}

export default connectDB
