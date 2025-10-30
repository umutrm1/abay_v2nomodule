import ContentArea from "./global/ContentArea.jsx";
import { SidebarProvider } from "./global/SideBarContext.jsx";
import { ToastContainer } from "react-toastify";


function App() {

  return (
    <>
      <SidebarProvider>
        <ContentArea />
      </SidebarProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={750}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        className="myToastContainer"      // tüm kapsayıcıya özel stil vermek isterseniz
        toastClassName="myToast"          // her toast kutusuna stil
        bodyClassName="myToastBody"       // içerik alanına stil
      />
    </>
  );
}

export default App;
