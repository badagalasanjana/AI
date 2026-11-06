const SUGGESTIONS = [
  '💰 How to create a budget?',
  '🏠 Calculate EMI for home loan',
  '📈 Best investment options in India',
  '🏦 How much should I save?',
  '📊 Explain SIP investments',
  '🧾 Tax saving tips under 80C',
]

function SuggestionChips({ onSelect }) {
  return (
    <div className="suggestions-container">
      <p className="suggestions-label">✨ Quick Questions</p>
      <div className="suggestions-chips">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            className="chip"
            onClick={() => onSelect(s.replace(/^[\p{Emoji}\s]+/u, '').trim())}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SuggestionChips
