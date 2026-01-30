'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Settings, Hash } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  agentName?: string;
  timestamp: string;
}

export function MessagingInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('Quinn');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents = [
    { id: '1', name: 'Quinn', type: 'Life Manager', status: 'online', avatar: '🎯' },
    { id: '2', name: 'Sam', type: 'Personal Assistant', status: 'online', avatar: '🤖' },
    { id: '3', name: 'Riley', type: 'CRM Operations', status: 'away', avatar: '💼' },
    { id: '4', name: 'Taylor', type: 'Finance', status: 'online', avatar: '💰' },
    { id: '5', name: 'Alex', type: 'Voice Assistant', status: 'busy', avatar: '🎤' },
    { id: '6', name: 'Jordan', type: 'Content Writer', status: 'offline', avatar: '✍️' },
  ];

  useEffect(() => {
    // Demo conversation
    const demoMessages: Message[] = [
      {
        id: '1',
        content: 'Hello! How can I help you today?',
        sender: 'agent',
        agentName: 'Quinn',
        timestamp: '10:30 AM'
      },
      {
        id: '2',
        content: 'I need help organizing my tasks for this week',
        sender: 'user',
        timestamp: '10:31 AM'
      },
      {
        id: '3',
        content: "I'd be happy to help you organize your tasks! Let me check your current workload and priorities. Based on your calendar, I can see you have several important items coming up this week.",
        sender: 'agent',
        agentName: 'Quinn',
        timestamp: '10:31 AM'
      },
      {
        id: '4',
        content: 'That would be great, thanks!',
        sender: 'user',
        timestamp: '10:32 AM'
      }
    ];
    setMessages(demoMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentResponses = [
        "I understand. Let me help you with that right away.",
        "That's a great question! Here's what I found...",
        "I've processed your request. Here are the results:",
        "Based on your current priorities, I recommend...",
        "I've updated your dashboard with the latest information.",
        "Perfect! I've taken care of that for you."
      ];

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: agentResponses[Math.floor(Math.random() * agentResponses.length)],
        sender: 'agent',
        agentName: selectedAgent,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex bg-background dark:bg-wizard-dark-bg">
      {/* Sidebar - Agent List */}
      <div className="w-64 border-r border-wizard-emerald-100 dark:border-wizard-dark-border p-4 bg-wizard-cream-50 dark:bg-wizard-dark-bg-secondary">
        <h3 className="font-semibold mb-4 text-wizard-emerald-900 dark:text-wizard-dark-text">
          Available Agents
        </h3>
        
        <div className="space-y-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.name)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                selectedAgent === agent.name
                  ? 'bg-wizard-emerald text-white'
                  : 'hover:bg-wizard-cream-100 dark:hover:bg-wizard-dark-bg-tertiary'
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-wizard rounded-full flex items-center justify-center text-lg">
                  {agent.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(agent.status)} rounded-full border-2 border-white`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${
                  selectedAgent === agent.name ? 'text-white' : 'text-wizard-emerald-900 dark:text-wizard-dark-text'
                }`}>
                  {agent.name}
                </div>
                <div className={`text-xs truncate ${
                  selectedAgent === agent.name 
                    ? 'text-wizard-cream-200' 
                    : 'text-wizard-emerald-600 dark:text-wizard-dark-text-muted'
                }`}>
                  {agent.type}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-wizard-emerald-100 dark:border-wizard-dark-border p-4 bg-surface dark:bg-wizard-dark-bg-secondary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash size={20} className="text-wizard-emerald-600" />
              <div>
                <h2 className="font-semibold text-wizard-emerald-900 dark:text-wizard-dark-text">
                  Chat with {selectedAgent}
                </h2>
                <p className="text-sm text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
                  {agents.find(a => a.name === selectedAgent)?.type}
                </p>
              </div>
            </div>
            
            <button className="p-2 text-wizard-emerald-600 hover:text-wizard-emerald-800 hover:bg-wizard-cream-100 dark:hover:bg-wizard-dark-bg-tertiary rounded-lg">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 wizard-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  message.sender === 'user' 
                    ? 'bg-wizard-emerald text-white' 
                    : 'bg-wizard-gold text-wizard-emerald-900'
                }`}>
                  {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-wizard-emerald text-white rounded-br-md'
                    : 'bg-wizard-cream-100 dark:bg-wizard-dark-bg-tertiary text-wizard-emerald-900 dark:text-wizard-dark-text rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className={`text-xs mt-2 ${
                    message.sender === 'user' 
                      ? 'text-wizard-emerald-200' 
                      : 'text-wizard-emerald-500 dark:text-wizard-dark-text-muted'
                  }`}>
                    {message.agentName && `${message.agentName} • `}{message.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-wizard-gold rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-wizard-emerald-900" />
                </div>
                <div className="bg-wizard-cream-100 dark:bg-wizard-dark-bg-tertiary rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-wizard-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-wizard-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-wizard-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-wizard-emerald-100 dark:border-wizard-dark-border p-4 bg-surface dark:bg-wizard-dark-bg-secondary">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Message ${selectedAgent}...`}
                className="wizard-input w-full"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="wizard-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}