import { OpenAIStream, OpenAIStreamPayload, ChatGPTMessage } from "./stream_parsing";
// Setting this runtime from nodejs to edge causes the app to fail in prod
export const config = {
  runtime: "edge",
};
export type InputMessage = {
  text: string;
  isUser: boolean;
}
export async function POST(request: Request, response: Response) {  
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
