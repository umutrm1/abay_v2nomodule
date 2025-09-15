import ContentArea from "./global/ContentArea.jsx";
import { SidebarProvider } from "./global/SideBarContext.jsx";

function App() {
  return (
    <SidebarProvider>
      <ContentArea/>
    </SidebarProvider>
  );
}

export default App;
