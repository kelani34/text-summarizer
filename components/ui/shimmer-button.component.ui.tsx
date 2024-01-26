import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes } from "react";

type Props = {};

export const ShimmerButton = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick: React.MouseEventHandler;
}) => {
  return (
    <button
      onClick={onClick}
      type="submit"
      className={cn(
        "outline-none inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none  focus:ring-slate-400 ",
        className
      )}
    >
      {children}
    </button>
  );
};

export default ShimmerButton;
