"use client";
import { useState } from 'react';

interface Message {
  text: string;
  isUser: boolean;
}
/*
TODO: Need to combine messages into one when getting a streamed response
TODO: Need to track message history and include it in the request
*/
export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamedMessage, setStreamedMessage] = useState('');
  const [loading, setLoading] = useState(false);

function functionSoon() {
    console.log(messages);
}

  async function handleMessageSubmit(text: string) {
    setMessages([...messages, { text, isUser: true }]);
    try {
      setLoading(true);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { text, isUser: true }],
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
      let full_msg = "";
      while (!done) {

        const { value, done: doneReading } = await reader.read();
        
        done = doneReading;
        const chunkValue = decoder.decode(value);
        if (!done) {
          setStreamedMessage(msg => msg + chunkValue);
          full_msg = full_msg + chunkValue;
        }
        
      }
      console.log(full_msg);
      setMessages(prevMessages => [...prevMessages, { text: full_msg, isUser: false }])
      setStreamedMessage('');
      // scrollToBios();
      setLoading(false);
      console.log(messages);
    } catch (error) {
      console.error("Error: ", error);
    }
  }


  return (
    <div className="flex flex-col items-center">
      <div className="flex mt-3">
        <h1 className="text-2xl font-bold mb-4 p-6 flex">Chat with ChatGPT-4</h1>

        <div
          className={`rounded-full w-32 h-12 flex items-center mt-4 justify-center text-white font-bold ${loading ? 'bg-yellow-500' : 'bg-green-500'
            }`}
        >
          {loading ? 'Loading' : 'Awaiting Input'}
        </div>
      </div>
      <ChatLog messages={messages} streamedMessage={streamedMessage} />
      <ChatInput onSubmit={handleMessageSubmit} />
<button onClick={functionSoon}> Press me </button>
    </div>
  );
}
function ChatLog({ messages, streamedMessage }: { messages: Message[], streamedMessage: string }) {

  return (
    <div className="m-5 flex flex-col w-3/5">
      {messages.map((message, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: message.isUser ? 'flex-end' : 'flex-start',
            margin: '10px 0',
          }}
        >
          <div
            style={{
              backgroundColor: message.isUser ? '#3CB371' : '#1C1C1C',
              color: message.isUser ? '#1C1C1C' : '#FFFFFF',
              borderRadius: '10px',
              padding: '10px 15px',
              whiteSpace: 'pre-wrap',
            }}
          >
            <p>{message.text}</p>
          </div>
        </div>
      ))}
      {streamedMessage !== "" && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            margin: '10px 0',
          }}
        >
          <div
            style={{
              backgroundColor: '#1C1C1C',
              color: '#FFFFFF',
              borderRadius: '10px',
              padding: '10px 15px',
              whiteSpace: 'pre-wrap', 
            }}
          >
            <p>{streamedMessage}</p>
          </div>
        </div>
      )}
    </div>
  );

}



      function ChatInput({onSubmit}: {onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');

      function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
      onSubmit(text);
      setText('');
  }

      return (
      <form onSubmit={handleSubmit}
        className="flex flex-col items-center w-3/5
                   bg-gray-800 p-4 rounded-lg max-w-screen-lg">
        <input type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          className="bg-gray-700 text-white py-2 px-4 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent mb-4 w-full"
          placeholder="Enter text" />

        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white 
      font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2
       focus:ring-blue-500 focus:border-transparent">Send</button>
      </form>

      );
}
