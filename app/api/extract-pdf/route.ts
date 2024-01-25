import extractTextFromPDF from "@/utils/extract-text-from-pdf";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.arrayBuffer();

    const extractedText = await extractTextFromPDF(body);

    return NextResponse.json({ data: extractedText }, { status: 200 });
  } catch (error) {
    console.log("[EXTRACT_PDF_ERROR]", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
