'use client'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { SmileIcon } from "lucide-react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export const EmojiPicker = ({
    onChange
}) => {

  return (
    <Popover>
        <PopoverTrigger>
            <SmileIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
        </PopoverTrigger>
        <PopoverContent
        className="w-full">
            <Picker 
            emojiSize={18}
            theme = "light"
            data={data}
            maxFrequentRows={1}
            onEmojiSelect = {(emoji) => onChange(emoji.native)}
            />
        </PopoverContent>
    </Popover>
  )
}