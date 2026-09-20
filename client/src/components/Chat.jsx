
import { useEffect, useRef, useState } from "react";

function Chat({ activeChat, onUpdateChat }) {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const container = messagesRef.current;

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeChat?.messages, loading]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Faqat rasm faylini tanlang.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Rasm hajmi 8 MB dan katta bo‘lmasin.");
      return;
    }

    setImage(file);

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const sendMessage = async () => {
    const text = message.trim();

    if ((!text && !image) || loading || !activeChat) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: text || "Rasm yuborildi",
      image: imagePreview || null,
      sender: "user",
    };

    const messages = [
      ...(activeChat.messages || []),
      userMessage,
    ];

    const userChat = {
      ...activeChat,
      messages,
      title:
        activeChat.messages?.length === 0
          ? text.slice(0, 35) || "Rasm"
          : activeChat.title,
    };

    onUpdateChat(userChat);

    setMessage("");
    setImage(null);
    setImagePreview("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await fetch(
        "http://localhost:3002/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            image: imagePreview || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "AI server xatosi"
        );
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: data.answer,
        sender: "ai",
      };

      onUpdateChat({
        ...userChat,
        messages: [...messages, aiMessage],
      });
    } catch (error) {
      console.error(error);

      const aiMessage = {
        id: Date.now() + 1,
        text:
          error.message ||
          "AI bilan bog‘lanishda xatolik yuz berdi.",
        sender: "ai",
      };

      onUpdateChat({
        ...userChat,
        messages: [...messages, aiMessage],
      });
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1800);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);

    e.target.style.height = "auto";

    e.target.style.height = `${Math.min(
      e.target.scrollHeight,
      150
    )}px`;
  };

  return (
    <main className="chat">
      <div
        className="chat-messages"
        ref={messagesRef}
      >
        <div className="chat-messages-inner">
          {activeChat?.messages?.length === 0 && (
            <div className="chat-empty">
              <div className="chat-empty-logo">
                D
              </div>

              <h1>Salom, DiyorAI 👋</h1>

              <p>
                Savolingizni yozing yoki rasm yuboring.
              </p>
            </div>
          )}

          {activeChat?.messages?.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${
                msg.sender === "user"
                  ? "user"
                  : "ai"
              }`}
            >
              <div className="message-avatar">
                {msg.sender === "user" ? "Siz" : "D"}
              </div>

              <div className="message-content">
                <div className="message-name">
                  {msg.sender === "user"
                    ? "Siz"
                    : "DiyorAI"}
                </div>

                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Yuborilgan rasm"
                    className="sent-image"
                  />
                )}

                {msg.text && (
                  <div className="message-text">
                    {msg.text}
                  </div>
                )}

                {msg.sender === "ai" && (
                  <div className="message-actions">
                    <button
                      className="copy-message-btn"
                      onClick={() =>
                        copyMessage(
                          msg.text,
                          msg.id
                        )
                      }
                    >
                      {copiedId === msg.id
                        ? "✓ Nusxalandi"
                        : "📋 Nusxalash"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row ai">
              <div className="message-avatar">
                D
              </div>

              <div className="message-content">
                <div className="message-name">
                  DiyorAI
                </div>

                <div className="typing-message">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="input-wrapper">
        {imagePreview && (
          <div className="upload-preview">
            <img
              src={imagePreview}
              alt="Preview"
            />

            <button
              type="button"
              onClick={removeImage}
              className="remove-image-btn"
            >
              ×
            </button>
          </div>
        )}

        <div className="chat-input-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />

          <button
            type="button"
            className="attach-image-btn"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={loading}
            title="Rasm yuborish"
          >
            +
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="DiyorAI'ga yozing..."
            rows="1"
            disabled={loading}
          />

          <button
            className="send-button"
            onClick={sendMessage}
            disabled={
              loading ||
              (!message.trim() && !image)
            }
            aria-label="Yuborish"
          >
            ➤
          </button>
        </div>

        <div className="input-info">
          Enter — yuborish · Rasm yuborish uchun + tugmasini bosing
        </div>
      </div>
    </main>
  );
}

export default Chat;
