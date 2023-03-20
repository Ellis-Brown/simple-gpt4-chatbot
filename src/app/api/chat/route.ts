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
  const { messages }: { messages: InputMessage[] } = await request.json();

  const transformedMessages: ChatGPTMessage[] = messages.map(msg => ({
    role: msg.isUser ? "user" : "system",
    content: msg.text,
  }));
  console.log(transformedMessages);
  const payload: OpenAIStreamPayload = {
    model: "gpt-4",
    messages: transformedMessages,
    max_tokens: 1000,
    stream: true,
  };
  const stream = await OpenAIStream(payload);
  return new Response(stream);
}



if (!process.env.OPENAI_KEY) {
  throw new Error("Missing env var from OpenAI");
}



const handler = async (req: Request): Promise<Response> => {
  const { prompt } = (await req.json()) as {
    prompt?: string;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-4   ",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;