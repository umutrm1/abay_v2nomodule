import { useContext, createContext, useState } from "react"
import { ReactComponent as ChevronFirst } from "../icons/chevron-first.svg";
import { ReactComponent as ChevronLast } from "../icons/chevron-last.svg";
import { ReactComponent as Bell } from "../icons/bell.svg";
import { ReactComponent as CalendarDays } from "../icons/calendar-days.svg";
import { ReactComponent as ChartNoAxesCombined } from "../icons/chart-no-axes-combined.svg";
import { ReactComponent as ChartPie } from "../icons/chart-pie.svg";
import { ReactComponent as ChartSpline } from "../icons/chart-spline.svg";
import { ReactComponent as Clipboardlist } from "../icons/clipboard-list.svg";
import { ReactComponent as Grid2x2 } from "../icons/grid-2x2.svg";
import { ReactComponent as Info } from "../icons/info.svg";
import { ReactComponent as Layoutdashboard } from "../icons/layout-dashboard.svg";
import { ReactComponent as Package } from "../icons/package.svg";
import { ReactComponent as Pencilruler } from "../icons/pencil-ruler.svg";
import {ReactComponent as Remote} from "../icons/git-pull-request-draft.svg";
import { ReactComponent as Store } from "../icons/store.svg";
import { ReactComponent as User } from "../icons/user.svg";
import { ReactComponent as Wrench } from "../icons/wrench.svg";
import { ReactComponent as Logs } from "../icons/logs.svg";
import nikeLogo from "../icons/nike-logo.png";
import { SidebarContext } from "./SidebarContext";
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Paintbrush } from '../icons/paintbrush.svg';

function SidebarShema({ children }) {
  const { expanded, setExpanded } = useContext(SidebarContext)

  return (
    <nav className={`fixed h-full flex flex-col bg-white transition-all shadow ${expanded ? "w-64" : "w-20"
      }`}  >
      <div className="p-4 pb-2 flex justify-between items-center">
        {/* <img
            src={nikeLogo}
            className={`fixed mt-10 overflow-hidden ml-12 transition-all ${
              expanded ? "w-32" : "w-0"
            }`}
            alt=""
          /> */}
        <button
          onClick={() => setExpanded((curr) => !curr)}
          className={`p-1.5 cursor-pointer rounded-lg bg-gray-50 hover:bg-gray-100 transition-all ${expanded ? "ml-48" : ""}`}
        >
          {expanded ? <ChevronFirst /> : <ChevronLast />}
        </button>
      </div>

      <ul className="flex-1 px-3 mt-10">
        {children}</ul>
    </nav>
  )
}

function SidebarItem({ icon, text, active, alert, onClick }) {
  const { expanded } = useContext(SidebarContext)

  return (
    <li onClick={onClick}
      className={`
        relative flex items-center h-12 py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${active
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 text-gray-600"
        }
    `}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"
          }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"
            }`}
        />
      )}

      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-indigo-100 text-indigo-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
        >
          {text}
        </div>
      )}
    </li>
  )
}

const SideBar = () => {
  const navigate = useNavigate();
  return (
    <SidebarShema>
      <SidebarItem onClick={() => navigate("/")} icon={<Layoutdashboard className="w-10" />} text={"Ana Sayfa"} />
      <SidebarItem onClick={()=>navigate("bayiler")} icon={<Store className="w-10"/>} text={"Bayiler"} />
      <SidebarItem onClick={() => navigate("musteriler")} icon={<User className="w-10" />} text={"Müşteriler"} />
      <SidebarItem onClick={() => navigate("projeler")} icon={<Clipboardlist className="w-10" />} text={"Projeler"} />
      <SidebarItem onClick={() => navigate("sistemler")} icon={<Wrench className="w-10" />} text={"Sistemler"} />
      <SidebarItem onClick={() => navigate("profiller")} icon={<Pencilruler className="w-10" />} text={"Profiller"} />
      <SidebarItem onClick={() => navigate("camlar")} icon={<Grid2x2 className="w-10" />} text={"Camlar"} />
      <SidebarItem onClick={() => navigate("digermalzemeler")} icon={<Package className="w-10" />} text={"Diğer Malzemeler"} />
      <SidebarItem onClick={() => navigate("boyalar")} icon={<Paintbrush className="w-8" />} text={"Boyalar"} />
      <SidebarItem onClick={() => navigate("kumandalar")} icon={<Remote className="w-8" />} text={"Kumandalar"} />
      <SidebarItem onClick={() => navigate("ayarlar")} icon={<Remote className="w-8" />} text={"Ayarlar"} />

      {/* <SidebarItem onClick={()=>navigate("bildirimler")} icon={<Bell className="w-10"/>} text={"Bildirimler"} /> */}
      {/* <SidebarItem onClick={()=>navigate("takvim")} icon={<CalendarDays className="w-10"/>} text={"Takvim"} /> */}
      {/* <SidebarItem onClick={()=>navigate("bargrafigi")} icon={<ChartNoAxesCombined className="w-10"/>} text={"Bar Grafiği"} /> */}
      {/* <SidebarItem onClick={()=>navigate("pastagrafigi")} icon={<ChartPie className="w-10"/>} text={"Pasta Grafiği"} /> */}
      {/* <SidebarItem onClick={()=>navigate("cizgigrafigi")} icon={<ChartSpline className="w-10"/>} text={"Çizgi Grafiği"} /> */}
      {/* <SidebarItem onClick={()=>navigate("sss")} icon={<Info className="w-10"/>} text={"S.S.S"} /> */}
    </SidebarShema>
  )
}

export default SideBar;