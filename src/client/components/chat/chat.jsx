import ChatTopbar, { SkeletonChatTopbar } from "./chat-topbar";
import { ChatList, SkeletonChatList } from "./chat-list";
import React, {  useContext, useEffect, useState } from "react";
import {  useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../App";

export function Chat() {
  const [userData, setUserData] = useState(undefined);
  const isMobile = false;
  const [isLoading, setIsLoading] = useState(false);
  const {socket} = useContext(AppContext)

  const { id } = useParams();
  const navigate = useNavigate()
  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/v1/user/${id}?order=DESC`)
      .then((res) => {
        if(res.ok) return res.json()
        else navigate('/t')
      })
      .then((data) => {
        setUserData(data)
        setIsLoading(false)
      })
  }, [id]);

  useEffect(() => {
    if (!userData) return
    socket.emit('room.join', parseInt(userData.id))
    return () => {
      socket.emit('room.leave', parseInt(userData.id))
    }
  }, [userData])

  return (
    <div className="flex flex-col justify-between w-full h-full">
      {isLoading ? (
        <>
          <SkeletonChatTopbar />
          <SkeletonChatList />
        </>
      ) : userData  ? (
        <>
          <ChatTopbar
            selectedUser={{ avatar: userData.avatar, name: userData.name, id: userData.id }}
          />
          <ChatList key={id}
            initialMessages={userData.messages}
            selectedUser={userData}
            isMobile={isMobile}
          />
        </>
      ) : <></>}
    </div>
  );
}
