import { OpenAIStream, OpenAIStreamPayload, ChatGPTMessage } from "./stream_parsing";
import type {  NextRequest } from 'next/server';

// Setting this runtime from nodejs to edge causes the app to fail in prod

export const config = {
  runtime: "edge",
};
export type InputMessage = {
  text: string;
  isUser: boolean;
}
export default async function POST(request: NextRequest) {  
  const { messages } : {  messages: InputMessage[] } = await request.json();  
  const passcode = process.env.PAID_ONLY;
  if (!passcode) {
    return new Response("Sorry, access is limited to approved beta testers", { status: 400 });
  }
  if (!messages[0].text.startsWith(passcode)) {
    return new Response("Sorry, access is limited to approved beta testers", { status: 400 });
  }
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
