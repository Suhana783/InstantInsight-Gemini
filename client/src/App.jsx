import { useState } from 'react';
import './App.css'; 
import { AskView } from './AskView.jsx'; // <-- IMPORT THE ASK VIEW COMPONENT

function App() {
  const STATIC_SUBTITLE = "Your personal AI assistant for jokes, motivation, and daily tips";
  
  // --- STATE FOR MAIN CARD VIEW ---
  const [content, setContent] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null); 
  const [currentView, setCurrentView] = useState('cards'); // 'cards' or 'ask'

  // --- STATE FOR ASK VIEW ---
  const [askQuestion, setAskQuestion] = useState('');
  const [isAskLoading, setIsAskLoading] = useState(false);
  const [askResponse, setAskResponse] = useState(''); 

  // --- Logic for the Three Main Feature Buttons (GET requests) ---
  const fetchContent = async (feature) => {
    if (isLoading || currentView !== 'cards') return; 
    setActiveFeature(feature);
    setIsLoading(true); 
    setContent('Thinking...'); 

    try {
      const response = await fetch(`/api/${feature}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      const data = await response.json();
      
      if (response.ok && data.content) { 
          // SUCCESS: Display content
          setContent(data.content); 
      } else if (response.status === 429) { 
          // FIX: Handle 429 Quota Exceeded gracefully from server.js
          setContent(`Quota Error: ${data.error}`);
      } else { 
          // Handle other server-side errors (500, etc.)
          setContent(`Error: ${data.error || 'Failed to fetch content.'}`); 
      }
    } catch (error) {
      console.error('Fetch error:', error);
      // This is for a true network error (server is offline/unreachable)
      setContent('Network Error: Could not reach the Express server.');
    } finally {
      setIsLoading(false); 
    }
  };

  // --- Logic for the Dedicated Ask View (POST request) ---
  const handleAskSubmit = async (e) => {
    e.preventDefault();
    const userQuestion = askQuestion.trim();
    if (!userQuestion) return;

    setIsAskLoading(true);
    setAskResponse('Thinking...'); 
    
    try {
        const response = await fetch('/api/ask', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userQuestion }),
        });

        const data = await response.json();
        const finalResponse = data.answer || data.content;

        if (response.ok && finalResponse) {
            // SUCCESS: Display response
            setAskResponse(finalResponse);
        } else if (response.status === 429) { 
            // FIX: Handle 429 Quota Exceeded gracefully from server.js
            setAskResponse(`Quota Error: ${data.error}`);
        } else {
            // Handle other server-side errors
            setAskResponse(`Error: ${data.error || 'Unknown server error.'}`);
        }
    } catch (error) {
        console.error('Ask Fetch error:', error);
        // This is for a true network error
        setAskResponse('Network Error: Could not process request.');
    } finally {
        setIsAskLoading(false);
    }
  };
    
  // Component for the Card Layout Page (nested component)
  const CardsView = () => {
      // Card component (remains nested inside CardsView)
      const Card = ({ title, description, feature, colorClass }) => (
        <div className={`card ${colorClass}`} onClick={() => !isLoading && fetchContent(feature)}>
          <h2>{title}</h2>
          <p>{description}</p>
          <button 
            onClick={(e) => { e.stopPropagation(); fetchContent(feature); }}
            disabled={isLoading || (activeFeature === feature && isLoading)}
          >
            {isLoading && activeFeature === feature ? 'Loading...' : `Get ${title.replace('Boost', '').trim()}`}
          </button>
        </div>
      );

      return (
        <div className="cards-view-content">
          <h1 className="main-title">Gemini-AI-Helper 🚀</h1>
          <p className="static-subtitle">{STATIC_SUBTITLE}</p>

          <div className="card-grid">
            <Card title="Daily Joke" description="Get a laugh with AI-generated humor" feature="joke" colorClass="joke" />
            <Card title="Motivation Boost" description="Get inspired with powerful quotes" feature="motivation" colorClass="motivation" />
            <Card title="Tip of the Day" description="Discover helpful life tips" feature="tip-of-the-day" colorClass="tip" />
          </div>

         
          <div className="content-display-container">
            <div className="content-display-card">
              <div className="textarea-container">
                <textarea
                  className="content-textarea"
                  value={content}
                  readOnly
                  placeholder="Click a card to generate new content from Gemini."
                  rows={4}
                />
                <button className="clear-btn" onClick={() => setContent('')} disabled={!content} aria-label="Clear content">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      );
  };


  return (
    <>
      <div className="container">
        {/* Conditional Rendering: Switch between Card View and Ask View */}
        {currentView === 'cards' ? 
          <CardsView /> 
          : 
          <AskView 
            askQuestion={askQuestion}
            setAskQuestion={setAskQuestion}
            handleAskSubmit={handleAskSubmit}
            isAskLoading={isAskLoading}
            askResponse={askResponse}
            setAskResponse={setAskResponse}
            setCurrentView={setCurrentView}
          />
        }
      </div>
      
      {/* Floating Action Button (FAB) - switches view */}
      <button 
        className="fab-button" 
        onClick={() => {
            setCurrentView(currentView === 'cards' ? 'ask' : 'cards');
            // Clear the other view's content when switching
            if (currentView === 'ask') setAskResponse('');
            else setContent('');
        }}
        disabled={isLoading || isAskLoading}
      >
        {currentView === 'cards' ? 'Ask Gemini' : 'Helper'}
      </button>
    </>
  );
}

export default App;