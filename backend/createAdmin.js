require('dotenv').config()
const bcrypt = require('bcryptjs')
const { connectDB, sequelize } = require('./src/config/db')
const { User } = require('./src/models/index')

async function main() {
  await connectDB()
  await sequelize.sync({ force: false })
  
  const hash = await bcrypt.hash('janzaid-super-admin@123', 10)
  const [user, created] = await User.findOrCreate({
    where: { email: 'janzaid.ktk98@gmail.com' },
    defaults: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'janzaid.ktk98@gmail.com',
      password: hash,
      role: 'super-admin',
      isActive: true,
      isEmailVerified: true,
    }
  })
  console.log(created ? 'Admin created!' : 'Admin already exists!')
  console.log(user.toJSON())
  process.exit(0)
}

main()