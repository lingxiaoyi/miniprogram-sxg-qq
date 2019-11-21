import { requestWithParameters, requestPdd } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // banner
  LOAD_BANNER: 'MODULES/HOME/LOAD_QUERYCONFIG',
  LOAD_BANNER_SUCCESS: 'MODULES/HOME/LOAD_QUERYCONFIG_SUCCESS',
  LOAD_SUBJECTINFO_SUCCESS: 'MODULES/HOME/SUBJECTINFO_SUCCESS',
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // banner
  loadBanner: () => ({
    type: types.LOAD_BANNER,
    loading: true
  }),
  loadBannerSuccess: (data = []) => ({
    type: types.LOAD_BANNER_SUCCESS,
    data
  }),
  loadSubjectInfoSuccess: (data = []) => ({
    type: types.LOAD_SUBJECTINFO_SUCCESS,
    data
  }),
  loadQueryConfigAsync() {
    return async dispatch => {
      dispatch(this.loadBanner());
      let res = await requestWithParameters(URL.app_config.queryConfig, {
        locations: JSON.stringify(['mxg_ggdh', 'mxg_symid', 'mxg_syzp']),
        platformType: 3
      });
      let obj = {};
      res.data.data.forEach(element => {
        obj[element.location] = element.banners
      });
      dispatch(this.loadBannerSuccess(obj));
    };
  },
  loadSubjectInfo() {
    return async dispatch => {
      dispatch(this.loadBanner());
      let res = await requestPdd(URL.pdd.getSubjectInfo, {});
      dispatch(this.loadSubjectInfoSuccess(res.data.data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
// banner
function banners(
  state = {
    loading: false,
    data: [],
    SubjectInfo: []
  },
  action
) {
  switch (action.type) {
    case types.LOAD_BANNER:
      return { ...state, loading: true };
    case types.LOAD_BANNER_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
      case types.LOAD_SUBJECTINFO_SUCCESS:
      return {
        ...state,
        loading: false,
        SubjectInfo: action.data
      };
    default:
      return state;
  }
}

export default banners;
