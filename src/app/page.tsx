"use client";
import { useState } from 'react';

interface Message {
  text: string;
  isUser: boolean;
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);

  async function handleMessageSubmit(text: string) {
    setMessages([...messages, { text, isUser: true }]);
  try {

     const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      
      const { value, done: doneReading } = await reader.read();
      
      done = doneReading;
      const chunkValue = decoder.decode(value); 
      console.log(chunkValue);   
      setMessages(prevMessages => [...prevMessages, { text: chunkValue, isUser: false }]);
      // setGeneratedBios((prev) => prev + chunkValue);
    }
    // scrollToBios();
    // setLoading(false);
    } catch (error) {
      console.error("Error: ", error);
    }
  }
  

  return (
    <div>
      <h1>Chat with ChatGPT-4</h1>
      <ChatLog messages={messages} />
      <ChatInput onSubmit={handleMessageSubmit} />
    </div>
  );
}

function ChatLog({ messages }: { messages: Message[] }) {
  return (
    <div>
      {messages.map((message, i) => (
        <p key={i} style={{ textAlign: message.isUser ? 'right' : 'left' }}>
          {message.text}
        </p>
      ))}
    </div>
  );
}

function ChatInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(text);
    setText('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={text} onChange={e => setText(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  );
}
