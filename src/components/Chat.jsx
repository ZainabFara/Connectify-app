import React, { useState, useEffect, useRef } from 'react';

import '../components/Css/Chat.css'; 

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null); 
    const [conversations, setConversations] = useState([]); 
    const messagesEndRef = useRef(null); 
  
    const loggedInUserId = Number(localStorage.getItem('userId')); // hämtar den inloggade användarens ID
  
    useEffect(() => {
      getConversations(); // Hämtar konversationer när sidan laddas
      getAllUsers();
    }, []);
  
    useEffect(() => {
      if (selectedConversationId) {
        getMessages(); // Hämtar meddelanden när en konversation väljs
      }
    }, [selectedConversationId]);
  
    // Hämta konversationer
    const getConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/conversations', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Kunde inte hämta konversationer');
        }
  
        const data = await response.json();
        console.log('Fetched conversations:', data);
        setConversations(data); 
      } catch (error) {
        console.error('Fel vid hämtning av konversationer:', error);
      }
    };
  
    // Hämta meddelanden för vald konversation
    const getMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (selectedConversationId) {
          const response = await fetch(`/api/messages?conversationId=${selectedConversationId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            throw new Error('Kunde inte hämta meddelanden');
          }
  
          const data = await response.json();
          setMessages(data); // Spara hämtade meddelanden
        } else {
          setMessages([]); // Om ingen konversation är vald, töm meddelandelistan
        }
      } catch (error) {
        console.error('Fel vid hämtning av meddelanden:', error);
      }
    };
  
    // Hämta alla användare för att visa avatarer
    const getAllUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Kunde inte hämta användare');
        }
  
        const data = await response.json();
        setAllUsers(data); // sparar användare
      } catch (error) {
        console.error('Fel vid hämtning av användare:', error);
      }
    };
  
    // Sortera meddelanden efter tid
    const sortedMessages = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
    // Hantera skickandet av nytt meddelande
    const handleSendMessage = async (e) => {
      e.preventDefault();
  
      if (newMessage.trim() === '' || !selectedConversationId) return;
  
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: newMessage,
            conversationId: selectedConversationId,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Kunde inte skicka meddelandet');
        }
  
        setNewMessage(''); 
        getMessages(); // Hämta meddelanden igen efter att ha skickat
      } catch (error) {
        console.error('Fel vid skickandet av meddelande:', error);
      }
    };
  
    // Radera ett meddelande
    const handleDeleteMessage = async (msgId) => {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/messages/${msgId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        setMessages(messages.filter((message) => message.id !== msgId)); // Filtrera bort det raderade meddelandet
      } catch (error) {
        console.error('Fel vid raderandet av meddelande:', error);
      }
    };
  
    // Kontrollerar om användaren är den inloggade
    const isLoggedInUser = (userId) => userId === loggedInUserId;
  
    // Scrolla till botten när nya meddelanden kommer in
    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [sortedMessages]);
  
    return (
      <div className="chat-container">
        <div className="conversation-list">
          <h3>Välj en konversation</h3>
          <ul>
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={selectedConversationId === conversation.id ? 'selected' : ''}
              >
                {conversation.name}
              </li>
            ))}
          </ul>
        </div>
  
        <div className="messages">
          {sortedMessages.length > 0 ? (
            sortedMessages.map((message) => {
              const sender = allUsers.find((user) => user.userId === message.userId);
  
              return (
                <div
                  key={message.id}
                  className={`message ${isLoggedInUser(message.userId) ? 'right' : 'left'}`}
                >
                  {!isLoggedInUser(message.userId) && sender && (
                    <div className="avatar">
                      <img src={sender?.avatar || ''} alt="Avatar" />
                    </div>
                  )}
                  <div className={`text ${isLoggedInUser(message.userId) ? 'right' : 'left'}`}>
                    {message.text}
  
                    {isLoggedInUser(message.userId) && (
                      <button onClick={() => handleDeleteMessage(message.id)}>Radera</button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>Inga meddelanden att visa</p>
          )}
          <div ref={messagesEndRef} />
        </div>
  
        <div className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Skriv ditt meddelande..."
          />
          <button onClick={handleSendMessage}>Skicka</button>
        </div>
      </div>
    );
  };
  
  export default Chat;