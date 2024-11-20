// QuestionForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import callGeminiApi from './GeminiApi';
import './QuestionForm.css';

const QuestionForm = () => {
  const [question, setQuestion] = useState('');
  const [chats, setChats] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [typing, setTyping] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationIndex, setActiveConversationIndex] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const typingInterval = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const storedConversations = JSON.parse(localStorage.getItem('conversations'));
    if (storedConversations && storedConversations.length > 0) {
      setConversations(storedConversations);
      setActiveConversationIndex(storedConversations.length - 1);
      setChats(storedConversations[storedConversations.length - 1]);
      setShowSuggestions(storedConversations[storedConversations.length - 1].length === 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!question.trim()) return;

    setShowSuggestions(false);

    const newChats = [...chats, { sender: 'user', message: question }];
    setChats(newChats);
    setQuestion('');
    setTyping(true);
    setStopped(false);

    const previousMessages = newChats.map(chat => chat.message).join(' ');

    const response = await callGeminiApi(previousMessages);

    let i = 0;
    typingInterval.current = setInterval(() => {
      if (i < response.length && !stopped) {
        setCurrentAnswer((prev) => prev + response[i]);
        i++;
      } else {
        clearInterval(typingInterval.current);
        setTyping(false);
        const updatedChats = [...newChats, { sender: 'ai', message: response }];
        setChats(updatedChats);
        setCurrentAnswer('');
        updateConversation(updatedChats);
      }
    }, 10);
  };

  const updateConversation = (updatedChats) => {
    const updatedConversations = [...conversations];
    if (activeConversationIndex !== null) {
      updatedConversations[activeConversationIndex] = updatedChats;
    } else {
      updatedConversations.push(updatedChats);
      setActiveConversationIndex(updatedConversations.length - 1);
    }
    setConversations(updatedConversations);
  };

  const handleStop = () => {
    clearInterval(typingInterval.current);
    setTyping(false);
    setChats((prevChats) => [...prevChats, { sender: 'ai', message: currentAnswer }]);
    setCurrentAnswer('');
  };

  const handlePredefinedMessage = (message) => {
    setQuestion(message);
    handleSubmit(new Event('submit'));
  };

  const handleNewConversation = () => {
    if (activeConversationIndex === null || conversations[activeConversationIndex].length === 0) return;

    const newChats = [];
    setChats(newChats);
    setCurrentAnswer('');
    setStopped(true);
    setShowSuggestions(true);

    const newConversations = [...conversations, newChats];
    setConversations(newConversations);
    setActiveConversationIndex(newConversations.length - 1);

    setTimeout(() => {
      inputRef.current.focus();
    }, 100);
  };

  const handleDeleteConversation = (index) => {
    const updatedConversations = conversations.filter((_, idx) => idx !== index);
    setConversations(updatedConversations);
    if (index === activeConversationIndex) {
      if (updatedConversations.length > 0) {
        const newIndex = Math.min(index, updatedConversations.length - 1);
        setActiveConversationIndex(newIndex);
        setChats(updatedConversations[newIndex]);
        setShowSuggestions(updatedConversations[newIndex].length === 0);
      } else {
        setActiveConversationIndex(null);
        setChats([]);
        setShowSuggestions(true);
      }
    } else if (index < activeConversationIndex) {
      setActiveConversationIndex((prev) => prev - 1);
    }
  };

  const handleConversationClick = (index) => {
    setChats(conversations[index]);
    setActiveConversationIndex(index);
    setShowSuggestions(conversations[index].length === 0);
  };

  useEffect(() => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }
}, [chats, currentAnswer, typing]);


  return (
    <div className="app-container">
      <div className="sidebar">
        <button
          className="new-convo-button"
          onClick={handleNewConversation}
          disabled={activeConversationIndex === null || conversations[activeConversationIndex].length === 0}
        >
          Start New Conversation
        </button>
        <ul className="conversation-list">
          {conversations.map((conversation, index) => (
            <li
              key={index}
              id={`convo-item-${index}`}
              className={`conversation-item ${index === activeConversationIndex ? 'active' : ''}`}
              onClick={() => handleConversationClick(index)}
            >
              Conversation {index + 1}
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(index);
                }}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">
        <div 
          className="header-and-suggestions"
          style={{ 
            opacity: showSuggestions ? 1 : 0, 
            transform: showSuggestions ? 'translateY(0)' : 'translateY(-100%)',
            pointerEvents: showSuggestions ? 'auto' : 'none'
          }}
        >
          <div className="header">
            <h1>Dodie <span>Ai</span></h1>
            <h2>How can I assist you today?</h2>
          </div>
          <div className="suggestions-container">
            {['Tell me about your services', 'Explain how something works like an engineer', 'What are the latest news updates?', 'Can you explain this code step-by-step?'].map((msg) => (
              <div key={msg} className="suggestion-card" onClick={() => handlePredefinedMessage(msg)}>
                <p>{msg}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`chat-container ${chats.length > 0 ? 'active' : ''}`} ref={chatContainerRef}>
          {chats.map((chat, index) => (
            <div
              key={index}
              className={`message ${chat.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              {chat.message}
            </div>
          ))}
          {typing && (
            <div className="message ai-message">
              {currentAnswer}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="question-form">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            className="question-input"
            disabled={typing}
            ref={inputRef}
          />
          <button type="submit" className="ask-button" disabled={typing || !question.trim()}>Ask</button>
          <button type="button" onClick={handleStop} className="stop-button" disabled={!typing}>Stop</button>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;