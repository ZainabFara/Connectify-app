import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Chat.css';


const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [activeConversation, setActiveConversation] = useState(localStorage.getItem("conversationId") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "https://i.pravatar.cc/100?img=1");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const userId = localStorage.getItem("userId");

  const [fakeChat, setFakeChat] = useState([
    {
      text: "Hej, hur mår du?",
      avatar: "https://i.pravatar.cc/100?img=1",
      username: "Maryan",
      userId: "fakeUser1",
    },
    {
      text: "Jag mår bra, hur mår du?",
      avatar: "https://i.pravatar.cc/100?img=9",
      username: "Zaina",
      userId: "fakeUser2",
    },
    {
      text: "Jag mår också bra!",
      avatar: "https://i.pravatar.cc/100?img=1",
      username: "Maryan",
      userId: "fakeUser1",
    },
  ]);

  const navigate = useNavigate();

  // // Visa alla meddelanden i konsolen vid uppdatering
  useEffect(() => {
    console.log("Alla meddelanden:", messages);
  }, [messages]);


 // Hämta meddelanden från localStorage om de är sparade där
  useEffect(() => {
    const storedMessages = localStorage.getItem(`messages_${userId}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      // Om inga meddelanden finns, visa de fejkade
      setMessages(fakeChat);
    }
  }, [userId]);

  // Hämta riktiga meddelanden baserat på användaren som är inloggad
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;

      try {
        const response = await fetch(
          `https://chatify-api.up.railway.app/messages?conversationId=${activeConversation}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Kunde inte hämta meddelanden");

        const data = await response.json();

        // Filtrera meddelanden baserat på användarens ID
        const userMessages = data.filter((msg) => msg.userId === userId);

        if (userMessages.length > 0) {
          // Om det finns riktiga meddelanden, visa dem
          setMessages(userMessages);
          localStorage.setItem(
            `messages_${userId}`,
            JSON.stringify(userMessages)
          );
        } else {
          // Om inga riktiga meddelanden finns, visa de fejkade
          setMessages(fakeChat);
        }
      } catch (error) {
        setError("Kunde inte hämta meddelanden");
      }
    };
    fetchMessages();
  }, [activeConversation, token, userId]);


 // Funktion för att skicka ett nytt meddelande
 const handleSendMessage = async () => {
  if (!newMessage.trim()) return;

  
  const currentAvatar = localStorage.getItem("avatar");
  const currentUsername = localStorage.getItem("username");


  try {
    const response = await fetch(
      "https://chatify-api.up.railway.app/messages",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newMessage,
          conversationId: activeConversation,
          avatar: currentAvatar,  
          username: currentUsername,  
        }),
      }
    );

    if (!response.ok) throw new Error("Meddelandet kunde inte skickas");

    const data = await response.json();
    const newMsg = {
      ...data.latestMessage,
      username: currentUsername,  
      avatar: currentAvatar, 
      userId: userId,
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMsg];
      localStorage.setItem(
        `messages_${userId}`,
        JSON.stringify(updatedMessages)
      );
      return updatedMessages;
    });
    setNewMessage("");
  } catch (error) {
    setError("Meddelandet kunde inte skickas");
  }
};


  // Funktion för att radera ett meddelande
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(
        `https://chatify-api.up.railway.app/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Meddelandet kunde inte raderas");

      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter(
          (message) => message.id !== messageId
        );
        localStorage.setItem(
          `messages_${userId}`,
          JSON.stringify(updatedMessages)
        ); 
        return updatedMessages;
      });
    } catch (error) {
      setError("Meddelandet kunde inte raderas");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    localStorage.removeItem(`messages_${userId}`); // Rensa meddelanden för användaren
    navigate("/login");
  };

  // Stilar för att centrera chattem
  const chatStyle = {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
  };

  return (
    <div className="chat-container">
      <button className="btn btn-danger mb-3 align-self-end" onClick={handleLogout}>
        Logga ut
      </button>
  
      <div className="chat-content">
        <h2 className="mb-4">Chatt</h2>
        <div className="messages-container">
          {messages.length === 0 ? (
            fakeChat.map((message, index) => (
              <div
                key={index}
                className={`message-container ${message.userId === userId ? 'self' : 'other'}`}
              >
                <div className={`message ${message.userId === userId ? 'self' : 'other'}`}>
                  <img
                    className="message-avatar"
                    src={message.avatar}
                    alt="avatar"
                  />
                  <div>
                    <div className="fw-bold">{message.username}</div>
                    <p className="mb-0">{message.text}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message-container ${message.userId === userId ? 'self' : 'other'}`}
              >
                <div className={`message ${message.userId === userId ? 'self' : 'other'}`}>
                  <img
                    className="message-avatar"
                    src={message.avatar || "https://i.pravatar.cc/100"}
                    alt="avatar"
                  />
                  <div>
                    <div className="fw-bold">{message.username}</div>
                    <p className="mb-0">{message.text}</p>
                    {message.userId === userId && (
                      <button onClick={() => handleDeleteMessage(message.id)} className="btn btn-link text-danger ms-2">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
  
        <div className="message-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Skriv ett meddelande..."
            className="message-input"
          />
          <button onClick={handleSendMessage} className="btn btn-success">
            Send
          </button>
        </div>
      </div>
    </div>
  );  
}

export default Chat;
