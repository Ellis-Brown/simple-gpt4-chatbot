import { NextRequest } from 'next/server';
import { Configuration } from 'openai';
import { OpenAIStream, OpenAIStreamPayload, ChatGPTMessage } from "./stream_parsing";

export const config = {
  runtime: "experimental-edge",
};
type Data = {
  message: string;
};


export type InputMessage = {
  text: string;
  isUser: boolean;
}
export async function POST(request: NextRequest, response: Response) {  
  const { messages } : {  messages: InputMessage[] } = await request.json(); //  { messages: InputMessage[] 

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
