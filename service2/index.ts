import { env } from 'bun'
import express from 'express'
import { execSync } from 'child_process'
const app = express()

const PORT = env.PORT ?? 8000
const MQ_ADDRESS = env.MQ_ADDRESS ?? 'localhost'
const MQ_PORT = env.MQ_PORT ?? 5672

console.log('Waiting for MQ to be ready...')
execSync(`./wait-for-it/wait-for-it.sh ${MQ_ADDRESS}:${MQ_PORT}`)
console.log('MQ is ready!')

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
