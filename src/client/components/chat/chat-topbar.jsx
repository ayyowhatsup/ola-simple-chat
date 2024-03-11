import React, { useContext, useEffect, useState } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Info, Phone, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "../ui/use-toast";
import { AppContext } from "../../App";

export const TopbarIcons = [{ icon: Phone }, { icon: Video }, { icon: Info }];

export default function ChatTopbar({ selectedUser }) {
  const [isOnline, setIsOnline] = useState(false)
  const {socket} = useContext(AppContext)
  const { toast } = useToast();
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
  return (
    <div className="w-full h-20 flex p-4 justify-between items-center border-b">
      <div className="flex items-center gap-2">
        <Avatar className="flex justify-center items-center">
          <AvatarImage
            src={selectedUser.avatar}
            alt={selectedUser.name}
            width={6}
            height={6}
            className="w-10 h-10 "
          />
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{selectedUser.name}</span>
          {isOnline && <span className="text-xs">Online</span>}
        </div>
      </div>

      <div>
        {TopbarIcons.map((icon, index) => (
          <div
            key={index}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
              "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white cursor-pointer"
            )}
            onClick={() => {
              toast({
                title: "Unavailable.",
                description: "Still in development process!",
              })
            }}
          >
            <icon.icon size={20} className="text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}

export const SkeletonChatTopbar = () => {
  return (
    <div className="w-full h-20 flex p-4 justify-between items-center border-b">
      <div className="flex items-center gap-2">
        <Avatar className="flex justify-center items-center">
          <Skeleton className="h-[40px] w-[40px] rounded-full"/>
        </Avatar>
        <div className="flex flex-col">
          <Skeleton className="h-[10px] w-[100px] rounded-sm mb-2"/>
          <Skeleton className="h-[10px] w-[70px] rounded-sm"/>
        </div>
      </div>

      <div>
        {TopbarIcons.map((icon, index) => (
          <div
            key={index}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
              "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white cursor-pointer"
            )}
          >
            <Skeleton className="h-[20px] w-[20px] rounded-full"/>
          </div>
        ))}
      </div>
    </div>
  );
};
