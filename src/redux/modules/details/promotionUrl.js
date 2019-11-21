import { requestPdd, requestJd } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/DETAILS/PROMOTION_URL/LEAR',
  LOAD: 'MODULES/DETAILS/PROMOTION_URL/LOAD',
  LOAD_SUCCESS: 'MODULES/DETAILS/PROMOTION_URL/LOAD_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clear: () => ({
    type: types.LEAR
  }),
  load: () => ({
    type: types.LOAD,
    loading: true
  }),
  loadSuccess: data => ({
    type: types.LOAD_SUCCESS,
    data
  }),
  loadPddAsync(id, custom_parameters) {
    return async dispatch => {
      dispatch(this.load());
      // console.log('=====================');
      // console.log(custom_parameters);
      // console.log('=====================');
      const res = await requestPdd(URL.pdd.urlGenerate, {
        goods_id: id,
        pid: '71072248',
        custom_parameters: custom_parameters || 0
      });
      const data = res.data.goods_promotion_url_generate_response.goods_promotion_url_list[0];
      const { we_app_web_view_short_url } = data;
      if (custom_parameters.indexOf('Own') !== -1) {
        dispatch(
          this.loadSuccess({
            ownShortUrl: we_app_web_view_short_url
          })
        );
      } else if (custom_parameters.indexOf('share') !== -1) {
        dispatch(
          this.loadSuccess({
            shareShortUrl: we_app_web_view_short_url
          })
        );
      }
    };
  },
  loadJdAsync(id, custom_parameters, materialUrl, couponUrl) {
    return async dispatch => {
      dispatch(this.load());
      const res = await requestJd(URL.jd.promotionLlink, {
        skuId: id, // 商品ID（必须）
        materialUrl, // 物料链接（必须）
        couponUrl, // 优惠券链接
        subUnionId: custom_parameters || 0, // 自定义推广参数
        isNew: '1'
      });
      const { shortURL } = res.data.data;
      if (custom_parameters.indexOf('Own') !== -1) {
        dispatch(
          this.loadSuccess({
            ownShortUrl: shortURL
          })
        );
      } else if (custom_parameters.indexOf('share') !== -1) {
        dispatch(
          this.loadSuccess({
            shareShortUrl: shortURL
          })
        );
      }
    };
  }
};

// ============================================================
// reducer
// ============================================================
function promotionUrl(state = { loading: false, data: {} }, action) {
  switch (action.type) {
    case types.LEAR:
      return { loading: false, data: {} };
    case types.LOAD:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        data: {
          ...state.data,
          ...action.data
        }
      };
    default:
      return state;
  }
}

export default promotionUrl;
