import { useState, useCallback } from 'react'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import SuggestionChips from './components/SuggestionChips'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'bot',
  content: "Hello! I'm **FinBot** 🤖, your AI-powered financial advisor. I can help you with budgeting, savings, loans, investments, and financial planning. What would you like to know today?",
  timestamp: new Date().toISOString(),
}

function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error: ${response.status}`)
      }

      const data = await response.json()

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.reply,
        timestamp: data.timestamp,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      setError(err.message || 'Failed to reach FinBot. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const showSuggestions = messages.length === 1 && messages[0].id === 'welcome'

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-logo">
            <span className="logo-icon">💰</span>
            <div className="logo-text">
              <span className="logo-title">FinBot</span>
              <span className="logo-subtitle">AI Financial Advisor</span>
            </div>
          </div>
          <div className="header-status">
            <span className="status-dot"></span>
            <span className="status-label">Online</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="chat-main">
        <ChatWindow messages={messages} isLoading={isLoading} />
        {showSuggestions && <SuggestionChips onSelect={sendMessage} />}
      </main>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Input */}
      <footer className="app-footer">
        <InputBar onSend={sendMessage} isLoading={isLoading} />
        <p className="footer-disclaimer">
          FinBot provides general financial information. Consult a certified advisor for personalized guidance.
        </p>
      </footer>
    </div>
  )
}

export default App
