import {combineReducers} from "redux"
import getBayilerFromApiReducer from "./getBayilerFromApiReducer";
import editBayilerOnApiReducer from "./editBayilerOnApiReducer";
import getMusterilerFromApiReducer from "./getMusterilerFromApiReducer";
import getProfillerFromApiReducer from "./getProfillerFromApiReducer";
import getDigerMalzemelerFromApiReducer from "./getDigerMalzemelerFromApiReducer";
import getCamlarFromApiReducer from "./getCamlarFromApiReducer";
import getSistemlerFromApiReducer from "./getSistemlerFromApiReducer";
import getProjelerFromApiReducer from "./getProjelerFromApiReducer";
import getSelectedFromProjelerTableReducer from "./getSelectedFromProjelerTableReducer";
import getSiparislerFromApiReducer from "./getSiparislerFromApiReducer";
import siparisDetayReducer from "./siparisDetayReducer";
import siparislerTableReducer from "./siparislerTableReducer";
import getSiparisDetayReducer from "./getSiparisDetayReducer";
import systemVariantsOfSystem from "./systemvariantsofsystem";
import getProjeFromApiReducer from "./getProjeFromApiReducer";
import getSystemFullVariantsOfSystemFromApiReducer from "./getSystemFullVariantsOfSystemFromApiReducer";
import getProjeRequirementsFromApiReducer from "./getProjeRequirementsFromApiReducer";
import getProfilImageFromApiReducer from "./getProfilImageFromApiReducer";
import getProfileColorsFromApiReducer from "./getProfileColorsFromApiReducer";
import getGlassColorsFromApiReducer from "./getGlassColorsFromApiReducer";
import getSystemVariantsFromApiReducer from "./getSystemVariantsFromApiReducer";
import auth from "./authReducer";
import getKumandalarFromApiReducer from "./getKumandalarFromApiReducer";
import pdfConfigsReducer from "./pdfConfigsReducer";
import getPdfTitleByKeyReducer from "./getPdfTitleByKeyReducer.js";
import getPdfBrandByKeyReducer from "./getPdfBrandByKeyReducer";
import getBrandImageReducer from "./getBrandImageReducer";


const rootReducer = combineReducers({
    getBayilerFromApiReducer,
    editBayilerOnApiReducer,
    getMusterilerFromApiReducer,
    getProfillerFromApiReducer,
    getDigerMalzemelerFromApiReducer,
    getCamlarFromApiReducer,
    getSistemlerFromApiReducer,
    getProjelerFromApiReducer,
    getSelectedFromProjelerTableReducer,
    getSiparislerFromApiReducer,
    siparisDetayReducer,
    siparislerTableReducer,
    getSiparisDetayReducer,
    systemVariantsOfSystem,
    getProjeFromApiReducer,
    getSystemFullVariantsOfSystemFromApiReducer,
    getProjeRequirementsFromApiReducer,
    getProfilImageFromApiReducer,
    getProfileColorsFromApiReducer,
    getGlassColorsFromApiReducer,
    getSystemVariantsFromApiReducer,
    auth,
    getKumandalarFromApiReducer,
    pdfConfigsReducer,
    getPdfTitleByKeyReducer,
    getPdfBrandByKeyReducer,
    getBrandImageReducer
})

export default rootReducer;