import app from "./app"
import config from "./config"
import {prisma} from './lib/prisma'

async function main() {
    const port = config.PORT || 5000
    try {
        await prisma.$connect()
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    }
    catch (error) {
        await prisma.$disconnect()
        console.log(error)
        process.exit(1)
    }
}
main()