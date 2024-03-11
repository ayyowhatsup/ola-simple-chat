import { cn } from "@/lib/utils";
import React, { useContext, useEffect, useRef, useState } from "react";
import _, { set } from "lodash";
import InfiniteScroll from 'react-infinite-scroll-component';
import { Avatar, AvatarImage } from "../ui/avatar";
import ChatBottombar, { SkeletonChatBottomBar } from "./chat-bottombar";
import { AnimatePresence, motion } from "framer-motion";
import { AppContext } from "../../App";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "../loading";

export function ChatList({ initialMessages, selectedUser, isMobile }) {
  const messagesContainerRef = useRef(null);
  const { user, socket } = useContext(AppContext);
  const [messages, setMessages] = useState(initialMessages)
  const [hasMore, setHasMore] = useState(initialMessages.length < 10 ? false : true)
  const [isOnline, setIsOnline] = useState(false)
  useEffect(() => {
    const onConnected = (id) => {
      if (selectedUser.id == id) setIsOnline(true)
    }
    const onDisconnected = (id) => {
      if (selectedUser.id == id) setIsOnline(false)
    }
    socket.on('user.connected', onConnected)
    socket.on('user.disconnected', onDisconnected)
    return () => {
      socket.off('user.connected', onConnected)
      socket.off('user.disconnected', onDisconnected)
    }
  }, [])
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const sanitize = (text) => {
    let sanitizedText = text;
    if (text.indexOf('<') > -1 || text.indexOf('>') > -1) {
      sanitizedText = text.replace(/</g, '&lt').replace(/>/g, '&gt');
    }
    return sanitizedText;
  };
  
  const sendMessage = (message) => {
    socket.emit('message', {fromId: user.id, toId: selectedUser.id, message: sanitize(message)})
  }

  useEffect(() => {
    const onMessage = (message) => {
      setMessages(prev => [message, ...prev])
    }

    socket.on('message', onMessage)

    return () => {
      socket.off('message')
    }
  }, []) 
  const fetchOldMessages = () => {
    fetch(`/api/v1/user/${selectedUser.id}?order=DESC&offset=${messages.length}`).then(res => res.json()).then(data => {
      const oldMessages = data.messages;
      if(oldMessages.length == 0){
        setHasMore(false)
      }else{
        setMessages(prev => [...prev, ...oldMessages])
      }
    })
  }
  return (
    <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
      <div id="scrollableDiv"
        ref={messagesContainerRef}
        className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col-reverse"
      >
        <InfiniteScroll dataLength={messages.length} endMessage={<h1 className="flex justify-center">No more old messages</h1>} inverse={true} className="overflow-hidden flex flex-col-reverse" hasMore={hasMore} loader={<div className="flex justify-center overflow-hidden"><LoadingSpinner/></div>} scrollableTarget="scrollableDiv" next={fetchOldMessages}>
        <AnimatePresence>
          {messages?.map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              className={cn(
                "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                message.fromId !== selectedUser.id ? "items-end" : "items-start"
              )}
            >
              <div className="flex gap-3 items-center">
                {message.fromId === selectedUser.id && (
                  <Avatar className="flex justify-center items-center relative overflow-visible">
                    <AvatarImage
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      width={6}
                      height={6}
                      className="rounded-full"
                    />
                    <div className={cn("absolute w-2 h-2 right-[1px] bottom-[1px] rounded-full", isOnline ? "bg-green-500" : 'bg-zinc-500')}></div>
                  </Avatar>
                )}
                <span className=" bg-accent p-3 rounded-md max-w-xs">
                  {message.message}
                </span>
                {message.fromId !== selectedUser.id && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarImage
                      src={user.avatar}
                      alt={user.name}
                      width={6}
                      height={6}
                    />
                  </Avatar>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        </InfiniteScroll>
      </div>
      <ChatBottombar sendMessage={sendMessage} isMobile={isMobile} />
    </div>
  );
}

export const SkeletonChatList = () => {
  return (
    <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
      <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
        <div>
          {new Array(6).fill(true).map((message, index) => {
            let fromMe = _.sample([true, false]) 
            return <div key={index}
              className={cn(
                "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                fromMe ? "items-end" : "items-start"
              )}
            >
              <div className="flex gap-3 items-center">
                {!fromMe == true && (
                  <Avatar className="flex justify-center items-center">
                    <Skeleton className="h-[40px] w-[40px] rounded-full" />
                  </Avatar>
                )}
                <Skeleton className="h-[40px] w-[150px] rounded-md" />
                {fromMe && (
                  <Avatar className="flex justify-center items-center">
                    <Skeleton className="h-[40px] w-[40px] rounded-full" />
                  </Avatar>
                )}
              </div>
            </div>;
          })}
        </div>
      </div>
      <SkeletonChatBottomBar />
    </div>
  );
};
