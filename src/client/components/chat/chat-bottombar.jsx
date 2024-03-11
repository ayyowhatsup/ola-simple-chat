import {
  FileImage,
  Mic,
  Paperclip,
  PlusCircle,
  SendHorizontal,
  ThumbsUp,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Textarea } from "../ui/textarea";
import { EmojiPicker } from "../emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Link } from "react-router-dom";
import { Skeleton } from "./../../components/ui/skeleton";

export const BottombarIcons = [{ icon: FileImage }, { icon: Paperclip }];

export default function ChatBottombar({ sendMessage, isMobile }) {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleThumbsUp = () => {
    sendMessage("👍");
    setMessage("");
  };

  const handleSend = () => {
    const newMessage = message.trim()
    if (newMessage) {
      sendMessage(newMessage);
      setMessage("");
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }

    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      setMessage((prev) => prev + "\n");
    }
  };

  return (
    <div className="p-2 flex justify-between w-full items-center gap-2">
      <div className="flex">
        <Popover>
          <PopoverTrigger asChild>
            <div
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9",
                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white cursor-pointer"
              )}
            >
              <PlusCircle size={20} className="text-muted-foreground" />
            </div>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-full p-2">
            {message.trim() || isMobile ? (
              <div className="flex gap-2">
                <div
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9",
                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white cursor-pointer"
                  )}
                >
                  <Mic size={20} className="text-muted-foreground" />
                </div>
                {BottombarIcons.map((icon, index) => (
                  <div
                    key={index}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "h-9 w-9",
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white cursor-pointer"
                    )}
                  >
                    <icon.icon size={20} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9",
                  "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white cursor-pointer"
                )}
              >
                <Mic size={20} className="text-muted-foreground" />
              </div>
            )}
          </PopoverContent>
        </Popover>
        {!message.trim() && !isMobile && (
          <div className="flex">
            {BottombarIcons.map((icon, index) => (
              <Link
                key={index}
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9",
                  "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                )}
              >
                <icon.icon size={20} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key="input"
          className="w-full relative"
          layout
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.05 },
            layout: {
              type: "spring",
              bounce: 0.15,
            },
          }}
        >
          <Textarea
            autoComplete="off"
            value={message}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            name="message"
            placeholder="Aa"
            className="w-full border rounded-full flex items-center h-9 resize-none overflow-hidden bg-background"
          ></Textarea>
          <div className="absolute right-2 bottom-0.5  ">
            <EmojiPicker
              onChange={(value) => {
                setMessage(message + value);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            />
          </div>
        </motion.div>

        {message.trim() ? (
          <div
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
              "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0 cursor-pointer"
            )}
            onClick={handleSend}
          >
            <SendHorizontal size={20} className="text-muted-foreground" />
          </div>
        ) : (
          <div
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
              "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0 cursor-pointer"
            )}
            onClick={handleThumbsUp}
          >
            <ThumbsUp size={20} className="text-muted-foreground" />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const SkeletonChatBottomBar = () => {
  return (
    <div className="p-3 flex justify-between w-full items-center gap-3">
        <Skeleton className="w-[25px] h-[25px] rounded-full" />
        <Skeleton className="w-[25px] h-[25px] rounded-full" />
        <Skeleton className="w-[25px] h-[25px] rounded-full" />
      <Skeleton className="flex-1 border rounded-full h-[30px]"></Skeleton>
      <Skeleton className="w-[25px] h-[25px] rounded-full" />
    </div>
  );
};
