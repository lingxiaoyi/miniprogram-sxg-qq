import { requestWithForm } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // banner
  LOAD_BANNER: 'MODULES/HOME/LOAD_LISTCATEGORY',
  LOAD_BANNER_SUCCESS: 'MODULES/HOME/LOAD_LISTCATEGORY_SUCCESS'
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
  loadlistcategoryAsync() {
    return async dispatch => {
      dispatch(this.loadBanner());
      let res = await requestWithForm(URL.SXGAPI_HOST.gethotlistcategory, {
        type: 2 //1:两小时榜,2:全天榜
      });
      dispatch(this.loadBannerSuccess(res.data.data));
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
    data: []
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
    default:
      return state;
  }
}

export default banners;
