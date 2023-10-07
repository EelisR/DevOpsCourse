import { env, sleepSync } from 'bun'
import express from 'express'
import { execSync } from 'child_process'
import ampq from 'amqplib'
const app = express()

const PORT = env.PORT ?? 8000 as const
const MQ_ADDRESS = env.MQ_ADDRESS ?? 'localhost' as const
const MQ_PORT = env.MQ_PORT ?? 5672 as const
const LOG = 'log' as const
const MESSAGE = 'message' as const


const mqChannel = await startMQListen()

startServer()

function startServer() {
  app.use(express.json())

  app.post('/', (req, res) => {
    const message = req.body.message

    if (message === 'STOP') {
      res.end()
      server.close()
      return
    }

    const originatingHost = req.body.origin
    const formattedMessage = `${message} ${originatingHost}`
    mqChannel.sendToQueue(LOG, Buffer.from(formattedMessage))
    res.end()
  })

  const server = app.listen(PORT)
  console.log('Server is running on port', PORT)
}

async function startMQListen() {
  waitForMq()
  const mqConnection = await ampq.connect(`amqp://${MQ_ADDRESS}:${MQ_PORT}`)
  const mqChannel = await mqConnection.createChannel()


  mqChannel.consume(MESSAGE, (message) => {
    if (!message)
      return
    const messageContent = message.content.toString()
    const newMessage = `${messageContent} MSG`
    mqChannel.sendToQueue(LOG, Buffer.from(newMessage))
  })

  return mqChannel
}

function waitForMq() {
  console.log('Waiting for MQ to be ready...')
  execSync(`./wait-for-it/wait-for-it.sh ${MQ_ADDRESS}:${MQ_PORT}`)
  console.log('MQ is ready!')
  console.log('Waiting for couple of seconds for queue inits')
  sleepSync(3000)
}

