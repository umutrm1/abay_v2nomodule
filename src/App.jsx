import ContentArea from "./global/ContentArea.jsx";
import { SidebarProvider } from "./global/SideBarContext.jsx";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
    <SidebarProvider>
      <ContentArea/>
    </SidebarProvider>
          <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}

export default App;
