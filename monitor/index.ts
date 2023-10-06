import { env } from 'bun'
import express from 'express'
const app = express()

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
