"use client";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { saveAs } from 'file-saver';
import { InputMessage } from './api/chat/route';

interface Message {
  text: string;
  isUser: boolean;
}

function gettokenEstimate(messages: Message[], response: string) {
  // 4 chars is about 1 token
  // $0.05 per 1k tokens
  // https://help.openai.com/en/articles/7127956-how-much-does-gpt-4-cost
  const totalChars = messages.reduce((acc, msg) => acc + msg.text.length, 0) + response.length;
  const totalTokens = Math.ceil(totalChars / 4);
  return totalTokens;
}

const rounding_percision = 100000;
export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamedMessage, setStreamedMessage] = useState('');
  const [loading, setLoading] = useState("Awaiting Input");
  const [tokenEstimate, settokenEstimate] = useState(0);

  function combineMessages(messages: Message[]) {
    const transformedMessages = messages.map(msg => ({
      role: msg.isUser ? "user" : "system",
      content: msg.text,
    }));

    return transformedMessages
  }

  function handleSaveClick() {
    const combinedMessages = combineMessages(messages);
    console.log(JSON.stringify(combinedMessages, null, 2));
    const blob = new Blob([JSON.stringify(combinedMessages)], { type: 'text/json;charset=utf-8' });
    // Get the current time for the filename
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, '-');
    saveAs(blob, 'chat-history-' + timestamp + '.json');
  }


  async function handleMessageSubmit(text: string) {
    
    setMessages([...messages, { text, isUser: true }]);
    const msgs : InputMessage[] = [...messages, { text, isUser: true }];
    try {
      setLoading("Loading");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: msgs
        }),
      });

      if (!response.ok) {
        setLoading("Error");
        throw new Error(response.statusText);
      }

      // This data is a ReadableStream
      const data = response.body;
      if (!data) {
        setLoading("Error");
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
      setLoading("Awaiting Input");
      settokenEstimate(gettokenEstimate(messages, full_msg));
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
          className={`rounded-full w-32 h-12 flex items-center mt-4 justify-center text-white font-bold ${loading  == "Loading" ? 'bg-yellow-500' : loading == "Awaiting Input" ? 'bg-green-500' : 'bg-red-500'
            }`}
        >
          {loading}
        </div>
      </div>
      <div className="text-gray-400">Token Estimate: {tokenEstimate}, Cost Estimate: ${Math.round(tokenEstimate / 1000 * 0.05 * rounding_percision) / rounding_percision}</div>

      <ChatLog messages={messages} streamedMessage={streamedMessage} />

      <ChatInput onSubmit={handleMessageSubmit} />
      
      <button onClick={handleSaveClick} className="mt-7 bg-blue-500 h-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
        Save Chat History
      </button>
      <div className="flex items-center justify-center my-3 pt-3 ">
        {/* https://github.com/Nutlope/twitterbio the github formatting was borrowed from here */}
      <a
          className="flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-300 bg-gray-700 px-4 py-2 text-sm text-gray-100 shadow-md transition-colors hover:bg-gray-900 mb-5"
          href="https://github.com/Ellis-Brown/simple-gpt4-chatbot"
          target="_blank"
          rel="noopener noreferrer"
        >
           <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
          <p>Star on GitHub</p>
        </a>
    
    </div>
    </div>
  );
}
function ChatLog({ messages, streamedMessage }: { messages: Message[], streamedMessage: string }) {

  return (
    <div style={{overflow: 'auto'}} className="m-5 flex flex-col w-3/5">
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
            <ReactMarkdown>{message.text}</ReactMarkdown>
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
            <ReactMarkdown>{streamedMessage}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );

}



function ChatInput({onSubmit}: {onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.shiftKey && event.key === 'Enter') {
      setText(text);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit(text);
      setText('');
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(text);
    setText('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center w-3/5 bg-gray-800 p-4 rounded-lg max-w-screen-lg"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-gray-700 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 w-full"
        placeholder="Enter text"
      />

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        Send
      </button>
    </form>
  );
}

