import React from 'react';

// Component for the Ask Question Page (stabilized component identity)
export function AskView({
    askQuestion,
    setAskQuestion,
    handleAskSubmit,
    isAskLoading,
    askResponse,
  setAskResponse
}) {
    return (
      <div className="ask-view-container">
        {/* Heading moved outside the ask-box with emoji */}
        <h1 className="ask-heading">💬 Ask a Question to Gemini</h1>

        <div className="ask-box">
          <form onSubmit={handleAskSubmit} className="ask-form">
            <textarea
              className="ask-textarea"
              placeholder="Type your question here..."
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              rows={5}
              disabled={isAskLoading}
            />
            <div className="modal-actions">
              {/* Button now clears input only */}
              <button type="button" onClick={() => setAskQuestion('')} className="modal-cancel-btn" disabled={isAskLoading}>
                Clear Input
              </button>
              <button 
                type="submit" 
                className="modal-submit-btn" 
                disabled={!askQuestion.trim() || isAskLoading}
              >
                {isAskLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>

        {/* Response Display for the Ask View */}
        {askResponse && (
          <div className="ask-response-display">
            <h2>Gemini's Response:</h2>
            <div className="content-display-ask">
              <p>{askResponse}</p>
            </div>
            <button className="clear-ask-btn" onClick={() => setAskResponse('')} disabled={isAskLoading}>Clear Response</button>
          </div>
        )}
      </div>
    );
}