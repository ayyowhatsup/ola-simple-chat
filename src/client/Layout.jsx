import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Link} from "react-router-dom";
import { ChatLayout } from "./components/chat/chat-layout";
import { useContext, useState } from "react";
import { AppContext } from "./App";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { toast } from "./components/ui/use-toast";
import { LoadingSpinner } from "./components/loading";
export function Layout() {
  const { user, socket } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const handleLogout = () => {
    setIsLoading(true)
    fetch('/api/v1/logout', {
      method: 'POST',
      credentials: 'include'
    }).then(res => {
      if(res.ok) {
        window.location.reload()
        socket.disconnect()
      }
      else throw new Error()
    }).catch(err => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }).finally(() => {
      setIsLoading(false)
    })
  }
  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
      <div className="flex justify-between max-w-5xl w-full items-center">
        <Link to={"/"} className="text-4xl font-bold text-gradient">
          Ola
        </Link>
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="flex justify-center items-center h-full w-[40px] cursor-pointer">
                <AvatarImage
                  className="rounded-full"
                  src={user.avatar}
                  width={"100%"}
                  height={"100%"}
                />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-40">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem className="cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent className="w-96">
            <DialogHeader>
              <DialogTitle>Log out?</DialogTitle>
              <DialogDescription>Do you want to log out?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleLogout}>
                {isLoading ? <LoadingSpinner/> : "Log out"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="z-10 border rounded-lg max-w-5xl w-full h-full text-sm lg:flex">
        <ChatLayout navCollapsedSize={8} />
      </div>
    </main>
  );
}
