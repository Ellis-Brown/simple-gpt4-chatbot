import type { NextApiRequest, NextApiResponse } from 'next';
import openai from 'openai';

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { text } = req.body;
  console.log('text', text);

  const completions = await openai.complete({
    engine: 'text-davinci-002',
    prompt: `Q: ${text}\nA:`,
    maxTokens: 128,
    n: 1,
    stop: ['\n'],
  });

  const message = completions.choices[0].text.trim();

  res.status(200).json({ message });
}


