import {combineReducers} from "redux"
import getBayilerFromApiReducer from "./getBayilerFromApiReducer.js";
import editBayilerOnApiReducer from "./editBayilerOnApiReducer.js";
import getMusterilerFromApiReducer from "./getMusterilerFromApiReducer.js";
import getProfillerFromApiReducer from "./getProfillerFromApiReducer.js";
import getDigerMalzemelerFromApiReducer from "./getDigerMalzemelerFromApiReducer.js";
import getCamlarFromApiReducer from "./getCamlarFromApiReducer.js";
import getSistemlerFromApiReducer from "./getSistemlerFromApiReducer.js";
import getProjelerFromApiReducer from "./getProjelerFromApiReducer.js";
import getSelectedFromProjelerTableReducer from "./getSelectedFromProjelerTableReducer.js";
import getSiparislerFromApiReducer from "./getSiparislerFromApiReducer.js";
import siparisDetayReducer from "./siparisDetayReducer.js";
import siparislerTableReducer from "./siparislerTableReducer.js";
import getSiparisDetayReducer from "./getSiparisDetayReducer.js";
import systemVariantsOfSystem from "./systemVariantsOfSystem.js";
import getProjeFromApiReducer from "./getProjeFromApiReducer.js";
import getSystemFullVariantsOfSystemFromApiReducer from "./getSystemFullVariantsOfSystemFromApiReducer.js";
import getProjeRequirementsFromApiReducer from "./getProjeRequirementsFromApiReducer.js";
import getProfilImageFromApiReducer from "./getProfilImageFromApiReducer.js";
import getProfileColorsFromApiReducer from "./getProfileColorsFromApiReducer.js";
import getGlassColorsFromApiReducer from "./getGlassColorsFromApiReducer.js";
import getSystemVariantsFromApiReducer from "./getSystemVariantsFromApiReducer.js";
import auth from "./authReducer.js";
import getKumandalarFromApiReducer from "./getKumandalarFromApiReducer.js";
import pdfConfigsReducer from "./pdfConfigsReducer.js";
import getPdfTitleByKeyReducer from "./getPdfTitleByKeyReducer.js";
import getPdfBrandByKeyReducer from "./getPdfBrandByKeyReducer.js";
import getBrandImageReducer from "./getBrandImageReducer.js";
import getSystemImageFromApiReducer from "./getSystemImageFromApiReducer.js";
import getSystemVariantImageFromApiReducer from "./getSystemVariantImageFromApiReducer.js";


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
    getBrandImageReducer,
    getSystemImageFromApiReducer,
    getSystemVariantImageFromApiReducer
})

export default rootReducer;