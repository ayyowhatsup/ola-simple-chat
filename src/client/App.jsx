import { createContext, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "./components/loading";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

export const AppContext = createContext();

const socket = io("", { autoConnect: false, withCredentials: true });

function App() {
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const openNewMessageDialogRef = useRef()
  socket.on("connect_error", function (e) {
    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: e.message,
    });
    window.location.reload()
  });

  useEffect(() => {
    fetch("/api/v1/user-info", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        navigate("/");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    document.title = 'Ola - ' + user.name
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user]);
  return (
    <>
      <Toaster />
      {isLoading ? (
        <div className="h-[calc(100dvh)] w-full fixed backdrop-blur flex justify-center items-center">
          <LoadingSpinner size={50} />
        </div>
      ) : (
        <AppContext.Provider value={{ user, setUser, socket, openNewMessageDialogRef }}>
          <Outlet />
        </AppContext.Provider>
      )}
    </>
  );
}

export default App;
