import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json())

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Proxies messages array to Groq, injects API key from env
async function callGroq(messages) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw Object.assign(new Error(err.error?.message || 'Groq API error'), { status: response.status })
  }

  return response.json()
}

// Accepts { messages: [...] }, forwards to Groq, returns raw Groq response
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }
  try {
    const data = await callGroq(messages)
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(err.status || 500).json({ error: err.message || 'Something went wrong. Please try again.' })
  }
})

// Serve Vite build for production
app.use(express.static(join(__dirname, 'dist')))
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`MedRoute running on http://localhost:${PORT}`))
