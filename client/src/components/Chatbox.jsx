import React, { useState, useEffect, useRef } from 'react';
import styles from './Chatbox.module.css';
import { useLocation } from 'react-router-dom';

const Chatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Mình là trợ lý ảo của BookSelf. Mình có thể giúp gì cho bạn hôm nay?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    const messagesEndRef = useRef(null);
    const location = useLocation();

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Don't show on admin pages
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        const messageText = inputValue.trim();
        if (!messageText) return;

        // Add user message
        setMessages(prev => [...prev, { sender: 'user', text: messageText }]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: messageText })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, server đang bận. Vui lòng thử lại sau.' }]);
            }
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Lỗi kết nối. Vui lòng kiểm tra mạng của bạn.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={styles.chatWrapper}>
            {!isOpen ? (
                <button 
                    className={styles.chatBubble} 
                    onClick={() => setIsOpen(true)}
                    title="Cần hỗ trợ? Chat với chúng tôi"
                >
                    <i className="fa-solid fa-message"></i>
                </button>
            ) : (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <div className={styles.botInfo}>
                            <div className={styles.botAvatar}>
                                <i className="fa-solid fa-robot"></i>
                            </div>
                            <div>
                                <h4 className={styles.botName}>BookSelf Bot</h4>
                                <span className={styles.botStatus}>Trực tuyến</span>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            &times;
                        </button>
                    </div>
                    
                    <div className={styles.chatBody}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`${styles.message} ${msg.sender === 'user' ? styles.messageUser : styles.messageBot}`}>
                                {msg.sender === 'bot' && (
                                    <div className={styles.msgAvatar}>
                                        <i className="fa-solid fa-robot"></i>
                                    </div>
                                )}
                                <div className={styles.msgText}>{msg.text}</div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={`${styles.message} ${styles.messageBot}`}>
                                <div className={styles.msgAvatar}>
                                    <i className="fa-solid fa-robot"></i>
                                </div>
                                <div className={styles.typingIndicator}>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className={styles.chatFooter} onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="Nhập tin nhắn..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isTyping}
                        />
                        <button type="submit" disabled={!inputValue.trim() || isTyping}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbox;
