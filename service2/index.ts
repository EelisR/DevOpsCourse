import { env } from 'bun'
import express from 'express'
const app = express()

const PORT = env.PORT ?? 8000
const FILE_PATH = env.FILE_PATH ?? '../logs/service2.log'

const file = Bun.file(FILE_PATH)
const writer = file.writer()

app.use(express.json())

app.post('/', (req, res) => {
  const message = req.body.message
  const host = req.headers.host

  if (message === 'STOP') {
    writer.end()
    res.end()
    server.close()
  } else {
    const formattedMessage = `${message} ${host} \n`
    console.log(formattedMessage)
    writer.write(formattedMessage)
    res.end()
  }
})

const server = app.listen(PORT)
console.log('Server is running on port', PORT)
