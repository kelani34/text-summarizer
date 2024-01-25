import { NextResponse } from "next/server";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(req: Request) {
  const instructionMessage: ChatCompletionRequestMessage = {
    role: "system",
    content:
      "Your task is to employ a highly advanced AI text summarizer capable of distilling intricate narratives into refined and nuanced summaries. The summarizer should refrain from generic attributions such as 'the speaker' and instead employ a more sophisticated approach to convey information. your response should be short and precise",
  };
  try {
    const body = await req.json();
    const { texts } = body;

    if (!texts) {
      return new NextResponse("Please enter a message", { status: 400 });
    }
    if (!configuration.apiKey) {
      return new NextResponse("API key not found", { status: 500 });
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-1106",
      messages: [instructionMessage, texts],
    });

    return NextResponse.json(response.data.choices[0].message);
  } catch (error) {
    console.log("[SUMMARY_GENERATOR_ERROR]", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
