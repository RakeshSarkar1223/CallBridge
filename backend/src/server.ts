import server from './app.ts'
import {connectDB} from './utils/connect.ts'
import 'dotenv/config'

connectDB();

server.listen(process.env.PORT, () => {
    console.log(`App is running on port ${process.env.PORT}`)
})