import { MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useContext } from "react";
import { AppContext } from "./App";

export default function Empty(){
    const {openNewMessageDialogRef} = useContext(AppContext)
    return (
        <div className="h-full w-full flex justify-center items-center text-sm">
            <div className="flex flex-col gap-2 items-center">
            <MessageCircleHeart size={48} strokeWidth={1} />
            Send message to your friends
            <Button onClick={() => {
                openNewMessageDialogRef.current.click()
            }} variant="outline" className="px-2 py-1">Send message</Button>
            </div>
        </div>
    )
}