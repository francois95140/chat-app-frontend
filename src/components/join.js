import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

function Join() {
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && room) {
            navigate('/chat', { state: { username, room } });
        }
    };

    return (
        <div className="join-container">
            <div className="join-header">
                <h1>Application de Chat</h1>
            </div>
            <div className="join-main">
                <form onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label htmlFor="username">Nom d'utilisateur</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label htmlFor="room">Code de la Room</label>
                        <input
                            type="text"
                            name="room"
                            id="room"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn">Rejoindre le Chat</button>
                </form>
            </div>
        </div>
    );
}

export default Join;