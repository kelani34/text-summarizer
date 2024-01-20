"use client";

import { BackgroundBeams } from "@/components/ui/background-beams.component.ui";
import ShimmerButton from "@/components/ui/shimmer-button.component.ui";
import { useRef, useState } from "react";
import { IconClipboard } from "@tabler/icons-react";
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

const MAX_MESSAGE_LENGTH = 5000;
export default function Home() {
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-24 container mx-auto">
      <h1 className="text-6xl font-semibold ">AI Text Summarizer</h1>
      <div className="flex rounded-md border min-h-96 w-full border-opacity-40 border-gray-200 ">
        <Form {...form}>
          <form className="flex-1 " onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormControl className="m-0 p-0">
                    <Textarea
                      className="bg-transparent resize-none  p-4 outline-none w-full h-full border-none"
                      disabled={isLoading}
                      placeholder="Enter a text you want to summarise"
                      {...field}
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

// console.log(summaryRef.current);
//   // navigator.clipboard
//   //   .writeText(text)
//   //   .then(() => {
//   //     console.log("Text copied to clipboard:", text);
//   //     // toast.success("Copied to clipboard");
//   //   })
//   //   .catch((err) => {
//   //     console.error("Error copying text to clipboard:", err);
//   //     // toast.error("Error copying to clipboard");
//   //   });
