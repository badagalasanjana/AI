/**
 * Parses a text string into React-renderable segments.
 * Supports:
 *  - **bold** → <strong>
 *  - Lines starting with "- " or "• " → <ul><li>
 */
function parseContent(text) {
  if (!text) return null

  const lines = text.split('\n')
  const elements = []
  let ulBuffer = []

  const flushUl = (key) => {
    if (ulBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="bubble-ul">
          {ulBuffer.map((item, i) => (
            <li key={i}>{parseLine(item)}</li>
          ))}
        </ul>
      )
      ulBuffer = []
    }
  }

  lines.forEach((line, idx) => {
    const stripped = line.trim()
    if (stripped.startsWith('- ') || stripped.startsWith('• ')) {
      ulBuffer.push(stripped.slice(2))
    } else {
      flushUl(idx)
      if (stripped === '') {
        // skip blank lines inside block but add spacing implicitly via gap
      } else {
        elements.push(<p key={`p-${idx}`}>{parseLine(stripped)}</p>)
      }
    }
  })
  flushUl('end')

  return elements
}

/** Splits a line by **bold** markers and returns mixed text/strong segments */
function parseLine(line) {
  const parts = line.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'bot-row'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div>
        <div className="message-bubble">
          <div className="bubble-text">
            {parseContent(message.content)}
          </div>
        </div>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  )
}

export default MessageBubble
