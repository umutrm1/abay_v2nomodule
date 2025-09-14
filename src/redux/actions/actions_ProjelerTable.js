import * as actionTypes from "./actionTypes";

export function getSelectedFromProjelerTableToReducer(payload) {
  return {
    type: actionTypes.GET_SELECTED_FROM_PROJELERTABLE,
    payload: payload,
  };
}

