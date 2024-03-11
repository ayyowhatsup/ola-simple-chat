import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import "@/app/globals.css";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { LoadingSpinner } from "./components/loading";
import { AppContext } from "./App";
import { useToast } from "./components/ui/use-toast";

export default function Home() {
  const { user, setUser } = useContext(AppContext);
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const handleRegister = () => {
    setIsLoading((prev) => !prev);
    fetch("/api/v1/register", {
      body: JSON.stringify({
        ...credentials,
        re_password: credentials.repeatPassword,
      }),
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (res.ok) {
          toast({
            title: "Success!",
            description: "Register account successfully!",
          });
        } else {
          const data = await res.json();
          throw new Error(data.message);
        }
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: err.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleLogin = () => {
    const { email, password } = credentials;
    setIsLoading((prev) => !prev);
    fetch("/api/v1/login", {
      body: JSON.stringify({ email, password }),
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (res.ok) return res.json();
        else {
          const data = await res.json();
          throw new Error(data.message);
        }
      })
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: err.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <>
      {user && <Navigate to={"/t"} />}
      <div className="h-[calc(100dvh)] z-[99] w-full fixed backdrop-blur-sm flex justify-center items-center">
        {isLoading ? (
          <LoadingSpinner size={50} />
        ) : (
          <Tabs defaultValue="login" className="w-[400px]">
            <Card>
              <CardHeader>
                <CardTitle>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle>Welcome to Ola!</CardTitle>
                <CardDescription>Login or create new account!</CardDescription>
                <TabsContent value="register">
                  <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={credentials.name}
                      onChange={(e) =>
                        setCredentials((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                </TabsContent>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>
                <TabsContent value="register" tabIndex={-1}>
                  <div className="space-y-1">
                    <Label htmlFor="re_password">Repeat password</Label>
                    <Input
                      id="re_password"
                      type="password"
                      value={credentials.repeatPassword}
                      onChange={(e) =>
                        setCredentials((prev) => ({
                          ...prev,
                          repeatPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                </TabsContent>
              </CardContent>
              <TabsContent value="login">
                <CardFooter>
                  <Button onClick={handleLogin}>Login</Button>
                </CardFooter>
              </TabsContent>
              <TabsContent value="register">
                <CardFooter>
                  <Button onClick={handleRegister}>Register</Button>
                </CardFooter>
              </TabsContent>
            </Card>
          </Tabs>
        )}
      </div>
    </>
  );
}
