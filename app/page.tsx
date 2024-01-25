"use client";

import { BackgroundBeams } from "@/components/ui/background-beams.component.ui";
import ShimmerButton from "@/components/ui/shimmer-button.component.ui";
import { useRef, useState } from "react";
import { IconClipboard, IconFileUpload, IconUpload } from "@tabler/icons-react";
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

const MAX_MESSAGE_LENGTH = 5000;
export default function Home() {
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [extractedText, setExtractedText] = useState<string>("");
  const [formText, setFormText] = useState<string>("");
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

  const router = useRouter();

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

  const handleFormClear = () => {
    form.reset();
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

    setExtractedText(result);
    setFormText(result);
    try {
      const res = await fetch("api/extract-pdf", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/pdf",
        },
      });

      const data = await res.json();
    } catch (error) {
      console.log(error);
    }
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
          console.error("Error uploading PDF:", error);
        }
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-24 container mx-auto">
      <input
        id="upload-pdf"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <h1 className="text-6xl font-semibold ">AI Text Summarizer</h1>
      <div className="flex rounded-md border min-h-96 w-full border-opacity-40 border-gray-200  ">
        <Form {...form}>
          <form className="flex-1 " onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="h-full group relative">
                  <Label
                    htmlFor="upload-pdf"
                    className="hover:bg-gray-500/40 text-neutral-300 group-hover:block group/btn hidden absolute top-2 right-2 cursor-pointer p-1 rounded-sm active:rounded-md duration-100 "
                  >
                    <div className="relative">
                      <IconFileUpload className="  h-4 w-4 transition duration-200 cursor-pointer active:text-neutral-400 " />

                      <div className="text-xs hidden absolute group-hover/btn:block w-max -bottom-1 right-6 transform translate-x-full group-hover/btn:translate-x-0 transition-transform bg-stone-600 px-2 py-1 rounded">
                        Upload pdf file format
                      </div>
                    </div>
                  </Label>
                  <FormControl className="m-0 p-0">
                    <Textarea
                      className="bg-transparent resize-none  p-4 outline-none w-full h-full border-none"
                      disabled={isLoading}
                      placeholder="Enter a text you want to summarise"
                      value={formText}
                      style={{ margin: "0px !important" }}
                      onChange={(e) => {
                        field.onChange(e);
                        setFormText(e.target.value);
                      }}
                      // {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <ShimmerButton className="mt-2">Summarize</ShimmerButton>
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
          <IconClipboard className=" absolute top-2 right-2 text-neutral-300 group-hover:block hidden h-4 w-4 transition duration-200 cursor-pointer active:text-neutral-400" />
        </div>
      </div>
      <BackgroundBeams />
    </main>
  );
}
