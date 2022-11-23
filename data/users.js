import bcrypt from 'bcrypt'
const users = [
  {
    name: 'John Doe',
    email: 'john@gmail.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Jane Doe',
    email: 'jane@gmail.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Admin',
    email: 'admin@gmail.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
]

export default users
