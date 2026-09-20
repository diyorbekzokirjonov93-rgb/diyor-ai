
function Message({ message }) {
  if (!message) {
    return null;
  }

  const isUser = message.sender === "user";

  return (
    <div className={`message-row ${isUser ? "user" : "ai"}`}>
      <div className="message-avatar">
        {isUser ? "D" : "AI"}
      </div>

      <div className="message-content">
        <div className="message-name">
          {isUser ? "You" : "DiyorAI"}
        </div>

        <div className="message-text">
          {message.text || ""}
        </div>

        {message.image && (
          <div className="message-image-wrapper">
            <img
              className="message-image"
              src={message.image}
              alt="Uploaded"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;


