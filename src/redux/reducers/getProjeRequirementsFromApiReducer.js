import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getProjeRequirementsFromApiReducer (state=initialState.projerequirements,action){
    switch (action.type){
        case actionTypes.GET_PROJE_REQUIREMENTS_FROM_API:
            return action.payload

        default:
            return state;


    }
}