import { OpenAIStream, OpenAIStreamPayload, ChatGPTMessage } from "./stream_parsing";
import type { NextRequest } from 'next/server';
// Setting this runtime from nodejs to edge causes the app to fail in prod

export const config = {
  runtime: "edge",
};
export type InputMessage = {
  text: string;
  isUser: boolean;
}

function validateModel(model: string) {
  const possible_models = ["gpt-4", "gpt-3.5-turbo", "code-davinci-002"];
  if (possible_models.includes(model.toLowerCase())) {
    return model.toLowerCase();
  } throw new Error("Invalid Model Name");
}

export default async function POST(request: NextRequest) {
  const { messages, model }: { messages: InputMessage[], model: string } = await request.json();
  const passcode = process.env.PAID_ONLY;
  try {
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
      model: validateModel(model),
      messages: transformedMessages,
      max_tokens: 1000,
      stream: true,
    };
    const stream = await OpenAIStream(payload);
    return new Response(stream);
  }
  catch (error) {
    console.log(error);
    return new Error();
  }
}
