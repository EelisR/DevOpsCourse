import { env, sleepSync } from 'bun'
import express from 'express'
import { execSync } from 'child_process'
import ampq from 'amqplib'
const app = express()

const PORT = env.PORT ?? 8000
const MQ_ADDRESS = env.MQ_ADDRESS ?? 'localhost'
const MQ_PORT = env.MQ_PORT ?? 5672

waitForMq()

const mqConnection = await ampq.connect(`amqp://${MQ_ADDRESS}:${MQ_PORT}`)
const mqChannel = await mqConnection.createChannel()
const logQueue = 'log'
const messageQueue = 'message'


mqChannel.consume(messageQueue, (message) => {
  if (!message) return
  const messageContent = message.content.toString()
  const newMessage = `${messageContent} MSG`
  mqChannel.sendToQueue(logQueue, Buffer.from(newMessage))
})

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
  mqChannel.sendToQueue(logQueue, Buffer.from(formattedMessage))
  res.end()
})

const server = app.listen(PORT)
console.log('Server is running on port', PORT)

function waitForMq() {
    console.log('Waiting for MQ to be ready...')
    execSync(`./wait-for-it/wait-for-it.sh ${MQ_ADDRESS}:${MQ_PORT}`)
    console.log('MQ is ready!')
    console.log('Waiting for couple of seconds for queue inits') 
    sleepSync(3000)
}

