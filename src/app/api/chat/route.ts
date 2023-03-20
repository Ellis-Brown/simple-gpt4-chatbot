import { NextRequest } from 'next/server';
import { Configuration } from 'openai';
import { OpenAIStream, OpenAIStreamPayload, ChatGPTMessage } from "./stream_parsing";

export const config = {
  runtime: "edge",
};
type Data = {
  message: string;
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

type InputMessage = {
  text: string;
  isUser: boolean;
}
export async function POST(request: NextRequest) {  
  const { messages } = await request.json(); //  { messages: InputMessage[] 

  const transformedMessages: ChatGPTMessage[] = messages.map((msg: { isUser: any; text: any; }) => ({
    role: msg.isUser ? "user" : "system",
    content: msg.text,
  }));
  const payload: OpenAIStreamPayload = {
    model: "gpt-4",
    messages: transformedMessages,
    max_tokens: 1000,
    stream: true,
  };
  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
