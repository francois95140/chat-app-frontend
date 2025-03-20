import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';

// Composant de notification global
const NotificationSystem = () => {
    useEffect(() => {
        // Vérifier si les notifications sont supportées
        if (!('Notification' in window)) {
            console.log('Ce navigateur ne supporte pas les notifications desktop');
            return;
        }

        // Demander la permission pour les notifications
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        // Connexion au socket
        const socket = io('http://localhost:3002');

        // Écouter les nouveaux messages pour les notifications
        socket.on('message', (messageData) => {
            const currentUser = JSON.parse(localStorage.getItem('chatUser')) || {};

            // Ne pas notifier pour ses propres messages
            if (messageData.username === currentUser.username) {
                return;
            }

            // Vérifier si l'utilisateur est sur la page de chat
            const isOnChatPage = window.location.pathname.includes('/chat');
            const isDocumentHidden = document.hidden;

            // Ne notifier que si l'utilisateur n'est pas sur la page de chat ou si la page est en arrière-plan
            if (!isOnChatPage || isDocumentHidden) {
                // Afficher une notification toast
                toast.info(`${messageData.username}: ${messageData.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });

                // Essayer d'envoyer une notification native si permis
                if (Notification.permission === 'granted') {
                    const notification = new Notification(`Message de ${messageData.username}`, {
                        body: messageData.message,
                        icon: '/favicon.ico' // Remplacez par votre icône
                    });

                    // Ouvrir la page de chat au clic sur la notification
                    notification.onclick = () => {
                        window.focus();
                        window.location.href = '/chat';
                    };
                }
            }
        });

        // Nettoyer à la déconnexion
        return () => {
            socket.disconnect();
        };
    }, []);

    return <ToastContainer />;
};

export default NotificationSystem;