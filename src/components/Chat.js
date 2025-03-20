import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Chat.css';

function Chat() {
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        // Rediriger si l'utilisateur n'a pas de nom ou de room
        if (!location.state || !location.state.username || !location.state.room) {
            navigate('/');
            return;
        }

        // Connexion au serveur WebSocket
        socketRef.current = io('http://localhost:3002');

        // Rejoindre la room
        socketRef.current.emit('joinRoom', {
            username: location.state.username,
            room: location.state.room,
        });

        // Écouter les messages
        socketRef.current.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Écouter les notifications d'utilisateurs
        socketRef.current.on('userJoined', (data) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { username: 'System', message: data.message, time: new Date().toLocaleTimeString() },
            ]);
        });

        socketRef.current.on('userLeft', (data) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { username: 'System', message: data.message, time: new Date().toLocaleTimeString() },
            ]);
        });

        // Écouter les mises à jour des utilisateurs
        socketRef.current.on('roomUsers', (roomUsers) => {
            setUsers(roomUsers);
        });

        // Écouter les événements de frappe
        socketRef.current.on('userTyping', (data) => {
            if (data.username !== location.state.username) {
                setTypingUsers((prevTypingUsers) => {
                    if (!prevTypingUsers.includes(data.username)) {
                        return [...prevTypingUsers, data.username];
                    }
                    return prevTypingUsers;
                });
            }
        });

        socketRef.current.on('userStoppedTyping', (data) => {
            setTypingUsers((prevTypingUsers) =>
                prevTypingUsers.filter((username) => username !== data.username)
            );
        });

        // Nettoyer à la déconnexion
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            socketRef.current.disconnect();
        };
    }, [location, navigate]);

    // Faire défiler vers le bas à chaque nouveau message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Gérer l'événement de frappe
    const handleTyping = () => {
        // Émettre l'événement "utilisateur en train de taper"
        socketRef.current.emit('typing');

        // Effacer tout timeout précédent
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Définir un nouveau timeout pour arrêter de taper après 3 secondes
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current.emit('stopTyping');
        }, 3000);
    };

    // Envoyer un message
    const sendMessage = (e) => {
        e.preventDefault();
        if (message) {
            // Envoyer le message
            socketRef.current.emit('sendMessage', { message });
            // Réinitialiser le message
            setMessage('');
            // Arrêter l'événement "en train de taper"
            socketRef.current.emit('stopTyping');
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h1>Chat Room: {location.state?.room}</h1>
                <button onClick={() => navigate('/')} className="btn">Quitter</button>
            </header>
            <main className="chat-main">
                <div className="chat-sidebar">
                    <h3>Utilisateurs</h3>
                    <ul id="users">
                        {users.map((user, index) => (
                            <li key={index}>{user.username}</li>
                        ))}
                    </ul>
                </div>
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.username === location.state?.username ? 'my-message' : ''}`}
                        >
                            <p className="meta">
                                {msg.username} <span>{msg.time}</span>
                            </p>
                            <p className="text">{msg.message}</p>
                        </div>
                    ))}
                    {typingUsers.length > 0 && (
                        <div className="typing-indicator">
                            {typingUsers.length === 1
                                ? `${typingUsers[0]} est en train d'écrire...`
                                : `${typingUsers.join(', ')} sont en train d'écrire...`}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            <div className="chat-form-container">
                <form onSubmit={sendMessage}>
                    <input
                        id="msg"
                        type="text"
                        placeholder="Entrez votre message..."
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            handleTyping();
                        }}
                        required
                        autoComplete="off"
                    />
                    <button className="btn" type="submit">Envoyer</button>
                </form>
            </div>
        </div>
    );
}

export default Chat;