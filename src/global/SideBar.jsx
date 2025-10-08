// src/global/SideBar.jsx
import { useContext } from "react";
import { ReactComponent as ChevronFirst } from "../icons/chevron-first.svg";
import { ReactComponent as ChevronLast } from "../icons/chevron-last.svg";
import { ReactComponent as Clipboardlist } from "../icons/clipboard-list.svg";
import { ReactComponent as Grid2x2 } from "../icons/grid-2x2.svg";
import { ReactComponent as Layoutdashboard } from "../icons/layout-dashboard.svg";
import { ReactComponent as Package } from "../icons/package.svg";
import { ReactComponent as Pencilruler } from "../icons/pencil-ruler.svg";
import { ReactComponent as Remote } from "../icons/git-pull-request-draft.svg";
import { ReactComponent as Offer } from "../icons/hand-coins.svg";
import { ReactComponent as Store } from "../icons/store.svg";
import { ReactComponent as User } from "../icons/user.svg";
import { ReactComponent as Wrench } from "../icons/wrench.svg";
import { ReactComponent as Settings } from "../icons/settings.svg";
import { SidebarContext } from "./SideBarContext.jsx";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Paintbrush } from "../icons/paintbrush.svg";

function SidebarShema({ children }) {
  const { expanded, setExpanded } = useContext(SidebarContext);

  return (
    <nav
      className={`fixed h-full flex flex-col transition-all
                  ${expanded ? "w-64" : "w-20"}
                  bg-card border-r border-border`}
    >
      <div className="p-4 pb-2 flex justify-between items-center">
        <button
          onClick={() => setExpanded((curr) => !curr)}
          className={`p-1.5 cursor-pointer rounded-lg transition-all
                      bg-secondary hover:opacity-90 ${expanded ? "ml-48" : ""}`}
        >
          {expanded ? <ChevronFirst /> : <ChevronLast />}
        </button>
      </div>

      <ul className="flex-1 px-3 mt-10">{children}</ul>
    </nav>
  );
}

// 🔧 Tema-dostu item
function SidebarItem({ icon, text, active, alert, onClick }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li
      onClick={onClick}
      className={`
        relative flex items-center h-12 py-2 px-3 my-1
        font-medium rounded-md cursor-pointer transition-colors group
        ${active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary"}
      `}
    >
      {/* ikonlar temada da rahat görünsün diye opak */}
      <span className="opacity-90">{icon}</span>

      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>

      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-primary ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {/* dar modda title tooltip'i */}
      {!expanded && (
        <div
          className={`
            absolute left-full rounded-md px-2 py-1 ml-6 z-50
            bg-card border border-border text-foreground text-sm
            invisible opacity-0 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          `}
        >
          {text}
        </div>
      )}
    </li>
  );
}

const SideBar = () => {
  const navigate = useNavigate();
  return (
    <SidebarShema>
      {/* Örnek: active prop'u route'a göre verebilirsin */}
      <SidebarItem onClick={() => navigate("bayiler")} icon={<Store className="w-10" />} text={"Bayiler"} />
      <SidebarItem onClick={() => navigate("musteriler")} icon={<User className="w-10" />} text={"Müşteriler"} />
      <SidebarItem onClick={() => navigate("projeler")} icon={<Clipboardlist className="w-10" />} text={"Projeler"} />
      <SidebarItem onClick={() => navigate("teklifler")} icon={<Offer className="w-10" />} text={"Teklifler"} />
   
      <SidebarItem onClick={() => navigate("sistemler")} icon={<Wrench className="w-10" />} text={"Sistemler"} />
      <SidebarItem onClick={() => navigate("profiller")} icon={<Pencilruler className="w-10" />} text={"Profiller"} />
      <SidebarItem onClick={() => navigate("camlar")} icon={<Grid2x2 className="w-10" />} text={"Camlar"} />
      <SidebarItem onClick={() => navigate("digermalzemeler")} icon={<Package className="w-10" />} text={"Diğer Malzemeler"} />
      <SidebarItem onClick={() => navigate("boyalar")} icon={<Paintbrush className="w-8" />} text={"Boyalar"} />
      <SidebarItem onClick={() => navigate("kumandalar")} icon={<Remote className="w-8" />} text={"Kumandalar"} />
      <SidebarItem onClick={() => navigate("ayarlar")} icon={<Settings className="w-8" />} text={"Ayarlar"} />
    </SidebarShema>
  );
};

export default SideBar;
