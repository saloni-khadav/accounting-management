import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, History, Plus, Trash2 } from 'lucide-react';
import { generateAccountingData } from '../utils/geminiApi';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI Accounting Assistant. I can help you with GST, invoices, reports, and more. Ask me anything!", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    loadChatHistory();
    const lastChatId = localStorage.getItem('lastChatId');
    if (lastChatId) {
      loadChat(lastChatId);
    } else {
      createNewChat();
    }
  }, []);

  const loadChatHistory = () => {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    setChatHistory(history);
  };

  const saveChat = (chatId, chatMessages, title = null) => {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const existingIndex = history.findIndex(chat => chat.id === chatId);
    
    const chatData = {
      id: chatId,
      title: title || (chatMessages.length > 1 ? chatMessages[1].text.substring(0, 30) + '...' : 'New Chat'),
      timestamp: Date.now(),
      messageCount: chatMessages.length
    };

    if (existingIndex >= 0) {
      history[existingIndex] = chatData;
    } else {
      history.unshift(chatData);
    }

    localStorage.setItem('chatHistory', JSON.stringify(history));
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatMessages));
    setChatHistory(history);
  };

  const loadChat = (chatId) => {
    const chatMessages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
    if (chatMessages.length === 0) {
      setMessages([{ id: 1, text: "Hello! I'm your AI Accounting Assistant. I can help you with GST, invoices, reports, and more. Ask me anything!", sender: 'bot' }]);
    } else {
      setMessages(chatMessages);
    }
    setCurrentChatId(chatId);
    localStorage.setItem('lastChatId', chatId);
    setShowHistory(false);
  };

  const createNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const initialMessage = [{ id: 1, text: "Hello! I'm your AI Accounting Assistant. I can help you with GST, invoices, reports, and more. Ask me anything!", sender: 'bot' }];
    setMessages(initialMessage);
    setCurrentChatId(newChatId);
    localStorage.setItem('lastChatId', newChatId);
    saveChat(newChatId, initialMessage);
    setShowHistory(false);
  };

  const deleteChat = (chatId) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    localStorage.removeItem(`chat_${chatId}`);
    
    if (currentChatId === chatId) {
      createNewChat();
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user'
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    const currentMessage = inputMessage;
    setInputMessage('');

    // Add typing indicator
    const typingMessage = {
      id: Date.now() + 1,
      text: 'Typing...',
      sender: 'bot',
      isTyping: true
    };
    const messagesWithTyping = [...updatedMessages, typingMessage];
    setMessages(messagesWithTyping);

    try {
      // Create accounting-focused prompt
      const accountingPrompt = `You are an AI Accounting Assistant for an accounting management system. 
      User question: "${currentMessage}"
      
      Please provide a helpful, accurate response about accounting, GST, invoices, financial reports, or business finance. 
      Keep the response concise and professional. If the question is not accounting-related, politely redirect to accounting topics.`;
      
      const aiResponse = await generateAccountingData(accountingPrompt);
      
      // Remove typing indicator and add real response
      const finalMessages = updatedMessages.concat([{
        id: Date.now() + 2,
        text: aiResponse || 'Sorry, I could not process your request.',
        sender: 'bot'
      }]);
      setMessages(finalMessages);
      
      // Save chat
      if (currentChatId) {
        saveChat(currentChatId, finalMessages);
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      // Remove typing indicator and add error message
      const errorMessages = updatedMessages.concat([{
        id: Date.now() + 2,
        text: 'Sorry, I\'m having trouble connecting. Please try again.',
        sender: 'bot'
      }]);
      setMessages(errorMessages);
      
      // Save chat
      if (currentChatId) {
        saveChat(currentChatId, errorMessages);
      }
    }
  };



  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-900 transition-all duration-300 z-50 hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-slate-800 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center">
              <Bot size={20} className="mr-2" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-white hover:text-gray-300 transition-colors p-1"
                title="Chat History"
              >
                <History size={18} />
              </button>
              <button
                onClick={createNewChat}
                className="text-white hover:text-gray-300 transition-colors p-1"
                title="New Chat"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-300 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat History Panel */}
          {showHistory && (
            <div className="border-b border-gray-200 p-4 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Chat History</h4>
              {chatHistory.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No chat history</p>
              ) : (
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        currentChatId === chat.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-gray-100'
                      }`}
                      onClick={() => loadChat(chat.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-slate-800 text-white'
                      : message.isTyping
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start">
                    {message.sender === 'bot' && <Bot size={16} className="mr-2 mt-1 flex-shrink-0" />}
                    <span className="text-sm">{message.text}</span>
                    {message.sender === 'user' && <User size={16} className="ml-2 mt-1 flex-shrink-0" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;