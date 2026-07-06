import server from './app.ts'
import {connectDB} from './utils/connect.ts'
import 'dotenv/config'

connectDB();

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`)
})