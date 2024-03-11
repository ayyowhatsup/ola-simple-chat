import { SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../App";
import { Skeleton } from "./ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function Sidebar({ isCollapsed, isMobile }) {
  const [links, setLinks] = useState([]);
  const { user, socket, openNewMessageDialogRef } = useContext(AppContext);
  const [isOpen, setIsOpen]  = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [modalLinks, setModalLinks] = useState([]);
  const [text, setText] = useState("");

  const messagesToLinks = (messages) =>
    messages.map((m) => ({
      name: m.receiver.id === user.id ? m.sender.name : m.receiver.name,
      message: user.id === m.receiver.id ? m.message : `You: ${m.message}`,
      avatar: m.receiver.id === user.id ? m.sender.avatar : m.receiver.avatar,
      id: m.receiver.id === user.id ? m.sender.id : m.receiver.id,
      variant: user.id === m.receiver.id ? "grey" : "ghost",
    }));

  useEffect(() => {
    const onNewMessage = (message) => {
      setLinks((prev) => {
        let old;
        const newLinks = prev
          .map((l) => {
            if (message.sender.id === l.id || message.receiver.id === l.id) {
              old = l;
              return undefined;
            }
            return l;
          })
          .filter((x) => x !== undefined);
        return old
          ? [{ ...old, ...messagesToLinks([message])[0] }, ...newLinks]
          : [...messagesToLinks([message]), ...newLinks];
      });
    };
    fetch("/api/v1/messages", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setLinks(messagesToLinks(data));
        setIsLoading(false);
        socket.on("message.new", onNewMessage);
      });
    const onConnected = (id) => {
      setLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, online: true } : l))
      );
    };
    const onDisconnected = (id) => {
      setLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, online: false } : l))
      );
    };
    socket.on("user.connected", onConnected);
    socket.on("user.disconnected", onDisconnected);

    return () => {
      socket.off("user.connected", onConnected);
      socket.off("user.disconnected", onDisconnected);
      socket.off("message.new", onNewMessage);
    };
  }, []);

  useEffect(() => {
    setIsLoadingModal(true);
    const id = setTimeout(() => {
      fetch(`/api/v1/users?q=${text}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setIsLoadingModal(false);
          setModalLinks(data);
        });
    }, 1000);
    return () => {
      clearTimeout(id);
    };
  }, [text]);

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative group flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2 min-w-[70px]"
    >
      <div
        className={cn(
          "flex p-2 items-center",
          isCollapsed ? " justify-center" : " justify-between"
        )}
      >
        {!isCollapsed && (
          <div className="flex gap-2 items-center text-2xl">
            <p className="font-medium">Chats</p>
            <span className="text-zinc-300">({links.length})</span>
          </div>
        )}
        <div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div
                ref={openNewMessageDialogRef}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9 cursor-pointer"
                )}
              >
                <SquarePen size={20} />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New message</DialogTitle>
              </DialogHeader>
              <Input
                type="text"
                placeholder="To: "
                value={text}
                onChange={(e) => {
                  setText(e.target.value.trim());
                }}
              />
              <div className="min-h-[300px]">
                {isLoadingModal
                  ? new Array(3).fill(0).map((e, i) => (
                      <div
                        key={i}
                        className={cn(
                          "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
                          "justify-start gap-2 p-2 flex"
                        )}
                      >
                        <Skeleton className="w-[40px] h-[40px] rounded-full" />
                        <div className="flex flex-col flex-1 w-full justify-between">
                          <Skeleton className="w-[60%] h-[15px]" />
                          <Skeleton className="w-full h-[15px]"></Skeleton>
                        </div>
                      </div>
                    ))
                  : modalLinks.map((e, i) => (
                      <Link onClick={() => setIsOpen(false)}
                        key={e.id}
                        to={`/t/${e.id}`}
                        className={cn(
                          "flex text-sm",
                          "justify-start gap-4 p-2"
                        )}
                      >
                        <Avatar className="flex justify-center items-center relative overflow-visible">
                          <AvatarImage
                            src={e.avatar}
                            alt={e.name}
                            width={6}
                            height={6}
                            className="w-10 h-10 rounded-full"
                          />
                        </Avatar>
                        <div className="flex flex-col max-w-28 flex-1 justify-center">
                          <span>{e.name}</span>
                        </div>
                      </Link>
                    ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <nav className="grid gap-2 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2 overflow-y-auto overflow-x-hidden">
        {isLoading &&
          new Array(5).fill(0).map((e, i) =>
            isCollapsed ? (
              <Skeleton key={i} className="w-[40px] h-[40px] rounded-full" />
            ) : (
              <div
                key={i}
                className={cn(
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
                  "justify-start gap-2 p-2 flex"
                )}
              >
                <Skeleton className="w-[40px] h-[40px] rounded-full" />
                <div className="flex flex-col flex-1 w-full justify-between">
                  <Skeleton className="w-[60%] h-[15px]" />
                  <Skeleton className="w-full h-[15px]"></Skeleton>
                </div>
              </div>
            )
          )}
        {!isLoading &&
          links.map((link, index) =>
            isCollapsed ? (
              <TooltipProvider key={link.id}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to={`/t/${link.id}`}
                      className={cn(
                        buttonVariants({
                          variant: link.variant,
                          size: "icon",
                        }),
                        "h-11 w-11 md:h-16 md:w-16",
                        link.variant === "grey" &&
                          "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                      )}
                    >
                      <Avatar className="flex justify-center items-center">
                        <AvatarImage
                          src={link.avatar}
                          alt={link.avatar}
                          width={6}
                          height={6}
                          className="w-10 h-10 "
                        />
                      </Avatar>{" "}
                      <span className="sr-only">{link.name}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="flex items-center gap-4"
                  >
                    {link.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Link
                key={link.id}
                to={`/t/${link.id}`}
                className={cn(
                  buttonVariants({ variant: link.variant, size: "xl" }),
                  link.variant === "grey" &&
                    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
                  "justify-start gap-4 p-2"
                )}
              >
                <Avatar className="flex justify-center items-center relative overflow-visible">
                  <AvatarImage
                    src={link.avatar}
                    alt={link.avatar}
                    width={6}
                    height={6}
                    className="w-10 h-10 rounded-full"
                  />
                  <div
                    className={cn(
                      "absolute w-2 h-2 right-[1px] bottom-[1px] rounded-full",
                      link?.online ? "bg-green-500" : "bg-zinc-500"
                    )}
                  ></div>
                </Avatar>
                <div className="flex flex-col max-w-28">
                  <span>{link.name}</span>
                  <span className="text-zinc-500 text-xs truncate ">
                    {link.message}
                  </span>
                </div>
              </Link>
            )
          )}
      </nav>
    </div>
  );
}
