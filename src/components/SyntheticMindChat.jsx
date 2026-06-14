import { useState, useRef, useEffect } from 'react';
import { sendMessageToSyntheticMind, initSyntheticMind } from '../services/gemini';
import FloatingParticles from './FloatingParticles';

export default function SyntheticMindChat() {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello. I am your Synthetic Mind. I have absorbed the knowledge of your Obsidian files. What would you like to discuss?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize Gemini and fetch Obsidian files on mount
    initSyntheticMind()
      .then(() => setIsInitializing(false))
      .catch(err => {
        console.error("Failed to init Synthetic Mind:", err);
        setMessages(prev => [...prev, { role: 'model', text: 'Error: Failed to initialize. Check your API key or backend connection.', isError: true }]);
        setIsInitializing(false);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isInitializing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToSyntheticMind(userMessage);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `Sorry, my neural pathways encountered an error:\n\n${err.message}`, 
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section-page synthetic-chat-page">
      <FloatingParticles type="dreamy" count={12} speed="slow" />
      
      <div className="section-header" style={{ marginBottom: 20 }}>
        <span className="section-header__emoji">🧠</span>
        <h2 className="section-header__title" style={{ fontFamily: 'var(--font-script)' }}>Synthetic Mind</h2>
        <p className="section-header__subtitle">powered by OpenRouter & your Obsidian vault</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role === 'user' ? 'chat-message--user' : 'chat-message--model'} ${msg.isError ? 'chat-message--error' : ''}`}>
              <div className="chat-bubble">
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message chat-message--model">
              <div className="chat-bubble chat-bubble--typing">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isInitializing ? "Connecting to your mind..." : "Ask your synthetic mind..."}
            disabled={isLoading || isInitializing}
          />
          <button type="submit" className="chat-send-btn" disabled={!input.trim() || isLoading || isInitializing}>
            ✨ Send
          </button>
        </form>
      </div>
    </div>
  );
}
