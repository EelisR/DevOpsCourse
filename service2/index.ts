import { env } from 'bun'
import express from 'express'
const app = express()

const PORT = env.PORT ?? 8000

app.use(express.json())

app.post('/', (req, res) => {
  const message = req.body.message

  if (message === 'STOP') {
    res.end()
    server.close()
    return
  }

  const originatingHost = req.body.origin
  const formattedMessage = `${message} ${originatingHost} \n`
  console.log(formattedMessage)
  res.end()
})

const server = app.listen(PORT)
console.log('Server is running on port', PORT)
