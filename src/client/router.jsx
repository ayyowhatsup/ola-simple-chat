import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  Navigate 
} from "react-router-dom";
import App from "./App";
import Home from "./Home";
import { Layout } from "./Layout";
import { Chat } from "./components/chat/chat";
import Empty from "./Empty";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />}></Route>
      <Route path="t" element={<Layout />}>
        <Route index element={<Empty/>}></Route>
        <Route path=":id" element={<Chat />}></Route>
      </Route>
      <Route path="*" element={<Navigate to={'/'} />}/>
    </Route>  
  )
);

export default router;
