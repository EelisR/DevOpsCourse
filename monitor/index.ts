import { env } from 'bun'
import express from 'express'
import { execSync } from 'child_process'
const app = express()

const MQ_ADDRESS = env.MQ_ADDRESS ?? 'localhost'

console.log('Waiting for MQ to be ready...')
execSync(`./wait-for-it/wait-for-it.sh ${MQ_ADDRESS}`)
console.log('MQ is ready!')

const PORT = env.PORT ?? 8087 

app.use(express.json())

const messages: string[] = ['Test']

app.get('/', (_, res) => {
  res.send(messages)
  res.contentType('text/plain')
  res.end()
})

app.listen(PORT)

console.log('Server is running on port', PORT)
