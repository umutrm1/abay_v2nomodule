import SideBar from "./global/SideBar";
import Topbar from "./global/TopBar";
import ContentArea from "./global/ContentArea";
import { useState,useContext } from "react";
import { SidebarProvider } from "./global/SidebarContext";

function App() {
  return (
    <SidebarProvider>
      <ContentArea/>
    </SidebarProvider>
  );
}

export default App;
