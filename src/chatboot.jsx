import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  Trash2,
  Sparkles,
  Settings,
  X,
  Copy,
  CheckCircle2
} from 'lucide-react';
import './ChatApp.css';

const QUICK_PROMPTS = [
  "Explain Quantum Computing in simple terms",
  "Give me a quick 15-minute dinner recipe",
  "Help me write a professional follow-up email",
  "Summarize how photosynthesis works"
];

const MOCK_AI_RESPONSES = [
  "**Quantum computing** leverages the mechanics of quantum physics to solve complex problems faster than classical supercomputers. While standard computers use bits (0s and 1s), quantum computers use **qubits** which can exist in multiple states simultaneously (superposition).",
  "Here is a quick **15-Minute Garlic Butter Pasta Recipe**:\n\n1. **Boil Pasta**: Cook pasta in salted water (10 mins).\n2. **Garlic Oil**: Sauté minced garlic in 2 tbsp butter and 1 tbsp olive oil for 1 min.\n3. **Toss**: Combine pasta, garlic butter, splash of pasta water, and fresh parmesan.\n4. **Serve**: Garnish with cracked black pepper and fresh parsley!",
  "Here is a clean follow-up email draft:\n\n**Subject:** Following up on our recent conversation\n\nHi [Name],\n\nI hope you're having a great week! I wanted to follow up on our recent discussion regarding [Topic]. Please let me know if you have any questions or if we are good to proceed.\n\nBest regards,\n[Your Name]",
  "**Photosynthesis** is the process plants use to convert sunlight, carbon dioxide, and water into oxygen and sugar (energy).\n\n- **Inputs:** Sunlight + Water ($H_2O$) + Carbon Dioxide ($CO_2$)\n- **Outputs:** Glucose ($C_6H_{12}O_6$) + Oxygen ($O_2$)"
];

export default function ChatApp() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "Hello! I'm your AI assistant. How can I help you today? Pick one of the suggested prompts or type your query below.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [useBackend, setUseBackend] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8081/api/chat');
  const [selectedModel, setSelectedModel] = useState('Gemini 1.5 Flash');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleCopy = (id, text) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleSend = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isTyping) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: currentTime
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    if (useBackend) {
      try {
        const response = await fetch("http://localhost:8081/api/chat", {
          method: 'POST',
          headers: { 'Content-Type': 'application/text' },
          body:  trimmed ,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response;
        const botMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply || data.message || 'No response returned from endpoint.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error('Backend fetch error:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sender: 'bot',
            text: '❌ Connection error: Could not connect to backend server at ' + backendUrl + '. You can toggle "Simulated Mode" in Settings.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsTyping(false);
      }
    } else {
      setTimeout(() => {
        let responseText = "";
        const promptIndex = QUICK_PROMPTS.indexOf(trimmed);
        
        if (promptIndex !== -1) {
          responseText = MOCK_AI_RESPONSES[promptIndex];
        } else {
          responseText = `Thank you for asking about **"${trimmed}"**.\n\nThis is a simulated AI response operating entirely inside your browser. You can seamlessly switch to your live backend endpoint inside the top-right Settings modal.`;
        }

        const botMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1200);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: "Conversation cleared! What else would you like to explore?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="chat-container">
      {/* App Header */}
      <header className="chat-header">
        <div className="header-info">
          <div className="bot-avatar-header">
            <Bot size={20} />
          </div>
          <div>
            <div className="title-row">
              <h2>AI Workspace</h2>
              <span className="model-badge">{selectedModel}</span>
            </div>
            <p className="status-indicator">
              <span className="status-dot"></span>
              {useBackend ? 'Backend API Active' : 'Standalone Mode'}
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button onClick={() => setShowSettings(!showSettings)} className="icon-button" title="Configure Settings">
            <Settings size={18} />
          </button>
          <button onClick={handleClearChat} className="icon-button danger" title="Clear Conversation">
            <Trash2 size={18} />
            <span className="button-text">Clear Chat</span>
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3><Settings size={16} /> Settings</h3>
              <button onClick={() => setShowSettings(false)} className="close-button">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="setting-toggle">
                <div>
                  <strong>Use Remote Backend Endpoint</strong>
                  <p>Connect to your local or cloud server</p>
                </div>
                <input
                  type="checkbox"
                  checked={useBackend}
                  onChange={(e) => setUseBackend(e.target.checked)}
                />
              </div>

              {useBackend && (
                <div className="setting-field">
                  <label>API Endpoint URL</label>
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="http://localhost:8081/api/chat"
                  />
                </div>
              )}

              <div className="setting-field">
                <label>Model Engine</label>
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                  <option value="Gemini 1.5 Flash">Gemini 1.5 Flash</option>
                  <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                  <option value="GPT-4o Mini">GPT-4o Mini</option>
                </select>
              </div>
            </div>

            <button onClick={() => setShowSettings(false)} className="save-button">
              Save & Apply
            </button>
          </div>
        </div>
      )}

      {/* Main Message Stream */}
      <main className="messages-area">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`message-row ${isUser ? 'user' : 'bot'}`}>
              <div className={`avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className="message-content">
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  {!isUser && (
                    <button onClick={() => handleCopy(msg.id, msg.text)} className="copy-button" title="Copy to clipboard">
                      {copiedId === msg.id ? <CheckCircle2 size={14} className="copied" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
                <span className="timestamp">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="message-row bot">
            <div className="avatar bot-avatar">
              <Bot size={16} />
            </div>
            <div className="message-bubble typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Footer */}
      <footer className="chat-footer">
        {messages.length <= 2 && !isTyping && (
          <div className="quick-prompts">
            <Sparkles size={14} className="sparkle-icon" />
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button key={idx} onClick={() => handleSend(prompt)} className="prompt-chip">
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="input-box">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            rows={1}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="send-button"
            title="Send Message"
          >
            <Send size={16} />
          </button>
        </div>

        <p className="input-hint">
          Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for new line.
        </p>
      </footer>
    </div>
  );
}