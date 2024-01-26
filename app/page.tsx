"use client";

import { BackgroundBeams } from "@/components/ui/background-beams.component.ui";
import ShimmerButton from "@/components/ui/shimmer-button.component.ui";
import { useRef, useState } from "react";
import { IconCheck, IconClipboard, IconFileUpload } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChatCompletionRequestMessage } from "openai";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form.component.ui";
import { Textarea } from "@/components/ui/textarea.component.ui";
// import { Worker, Viewer } from "@react-pdf-viewer/core";
import { Label } from "@/components/ui/label.component.ui";
import extractTextFromPDF from "@/utils/extract-text-from-pdf";
import { IconPlaylistX } from "@tabler/icons-react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip.component.ui";
import { Loader } from "@/components/loader.component";
import { toast } from "sonner";

const MAX_MESSAGE_LENGTH = 5000;
export default function Home() {
  const router = useRouter();

  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [formText, setFormText] = useState<string>("");
  const [copiedText, setCopiedtext] = useState<boolean>(false);
  const [text, setText] = useState<ChatCompletionRequestMessage>({
    role: "user",
    content: "",
  });

  const formSchema = z.object({
    prompt: z.string().min(1, {
      message: "Prompt is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError("");
      setText({ role: "user", content: "" });

      if (values.prompt.length > MAX_MESSAGE_LENGTH) {
        setError(
          "Oops, looks like your text is really long... only 5000 characters allowed"
        );
        setIsLoading(false);
        return;
      }

      const userText: ChatCompletionRequestMessage = {
        role: "user",
        content: values.prompt,
      };

      const response = await axios.post("/api/summarise", {
        texts: userText,
      });

      setText(response.data);
    } catch (error: any) {
      setError("Oops! Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const copyToClipboard = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopiedtext(true);
          setTimeout(() => {
            setCopiedtext(false);
          }, 2000);
          toast(`Text copied to clipboard: ${text}`);
        },
        (error) => {
          setCopiedtext(false);
          toast(`Unable to copy text to clipboard: ${error}`);
        }
      );
    }
  };
  const handleFormClear = () => {
    form.reset();
    setFormText("");
    setExtractedText("");
  };

  const handleResultClear = () => {
    setText({ role: "system", content: "" });
  };

  const handleCopyResult = () => {
    copyToClipboard(text.content);
  };
  const readFileAsBuffer = (file: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const buffer = event.target.result;
        resolve(buffer);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const getTextFromPdf = async (pdfBuffer: any) => {
    const formData = new FormData();
    formData.append("pdf", new Blob([pdfBuffer], { type: "application/pdf" }));

    const result = await extractTextFromPDF(pdfBuffer);
    handleResultClear();
    setExtractedText(result);
    setFormText(result);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.currentTarget.files;

    if (files && files.length > 0) {
      const file = files[0];

      if (file) {
        try {
          const pdfBuffer = await readFileAsBuffer(file);
          await getTextFromPdf(pdfBuffer);
        } catch (error) {
          toast(`Error uploading PDF: ${error}`);
        }
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 md:p-24 container mx-auto justify-center ">
      <input
        id="upload-pdf"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <h1 className="md:text-6xl md:font-semibold text-center text-3xl">
        AI Text Summarizer
      </h1>
      <div className="flex md:flex-row flex-col-reverse rounded-md border min-h-[calc(100vh-30vh)] md:min-h-96 w-full border-opacity-40 border-gray-200  ">
        <Form {...form}>
          <form className="flex-1 " onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="h-full md:group relative">
                  <div className="hover:bg-gray-500/40 group-hover:block md:group-hover:bg-gray-400  bg-gray-400  gap-3 group/btn md:hidden absolute top-2 right-2 cursor-pointer rounded-sm px-1 active:rounded-md duration-100 ">
                    <div className="relative">
                      <div className="flex gap-3 items-center">
                        <Label htmlFor="upload-pdf">
                          <AnimatedTooltip name="Upload pdf file format">
                            <IconFileUpload className=" text-neutral-300  h-6 w-6 transition duration-200 cursor-pointer hover:text-white p-1 active:text-neutral-400 " />
                          </AnimatedTooltip>
                        </Label>
                        <AnimatedTooltip name="Clear text">
                          <IconPlaylistX
                            onClick={handleFormClear}
                            className=" text-neutral-300  h-6 w-6 transition duration-200 cursor-pointer hover:text-white p-1  active:text-neutral-400  rounded"
                          />
                        </AnimatedTooltip>
                      </div>
                    </div>
                  </div>
                  <FormControl className="m-0 p-0 ">
                    <Textarea
                      className="bg-transparent resize-none  p-4 outline-none w-full h-full border-none"
                      disabled={isLoading}
                      placeholder="Enter a text you want to summarise"
                      value={formText}
                      style={{ margin: "0px" }}
                      onChange={(e) => {
                        field.onChange(e);
                        setFormText(
                          extractedText ? extractedText : e.target.value
                        );
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <ShimmerButton
              onClick={() => {
                if (extractedText) handleSubmit({ prompt: extractedText });
              }}
              className="mt-2"
            >
              Summarize
            </ShimmerButton>
          </form>
        </Form>
        <hr className="border-[.5px] border-opacity-40 border-gray-200 h-auto " />
        <div className="flex-1 relative group">
          <textarea
            ref={summaryRef}
            value={text.content}
            readOnly
            className="bg-transparent resize-none  outline-none p-4 h-full w-full"
          />
          {isLoading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Loader />
            </div>
          )}

          <div
            className={`absolute top-2 right-2 flex gap-3 md:group-hover:bg-gray-400  bg-gray-400 rounded px-1 ${
              !text.content ? "hidden" : "group-hover:flex md:hidden "
            }`}
          >
            <AnimatedTooltip name={copiedText ? "Copied" : "Copy text"}>
              {copiedText ? (
                <IconCheck className="text-green-500 bg-slate-500 h-6 w-6 transition duration-200 p-1 rounded " />
              ) : (
                <IconClipboard
                  onClick={handleCopyResult}
                  className={`   h-6 w-6 transition duration-200 cursor-pointer  hover:text-white p-1 rounded text-neutral-300 active:text-neutral-400  `}
                />
              )}
            </AnimatedTooltip>
            <AnimatedTooltip name="Clear result">
              <IconPlaylistX
                onClick={handleResultClear}
                className={`  text-neutral-300  h-6 w-6 transition duration-200 cursor-pointer active:text-neutral-400 hover:text-white p-1 rounded `}
              />
            </AnimatedTooltip>
          </div>
        </div>
      </div>
      <BackgroundBeams />
    </main>
  );
}
