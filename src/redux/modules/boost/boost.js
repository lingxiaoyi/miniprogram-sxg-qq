import { requestPdd, requestJd } from '../../../utils/api';
import { priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD_GOODS: 'BOOST/LOAD',
  LOAD_GOODS_SUCCESS: 'BOOST/SUCCESS',
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // 商品列表
  loadGoods: () => ({
    type: types.LOAD_GOODS,
    loading: true
  }),
  loadGoodsSuccess: (data = []) => ({
    type: types.LOAD_GOODS_SUCCESS,
    receiveAt: Date.now(),
    data
  }),
  async requestGoods(accid = '', selectedOpt = 1) {
    let data = [];
    const res = await requestPdd(URL.applets_theme_operation_list, {
      sub_id: selectedOpt, // 专题id
      // cate_id: '', // 分类id
      accid
    });

    const goodsList = res.data;

    goodsList.forEach(gd => {
      const {
        goods_id,
        goods_name,
        goods_thumbnail_url,
        sales_tip,
        min_group_price,
        coupon_discount,
        promotion_rate
      } = gd;

      data.push({
        id: goods_id, // 商品ID
        name: goods_name, // 商品标题
        thumbnail: goods_thumbnail_url, // 商品缩略图
        soldQuantity: sales_tip, // 已售数量
        newPrice: minus(min_group_price, coupon_discount) / 100, // 券后价
        oldPrice: min_group_price / 100, // 原价
        coupon: coupon_discount / 100, // 优惠券金额
        commission: Math.floor((promotion_rate / 1000) * (minus(min_group_price, coupon_discount) / 100) * 100) / 100 // 佣金
      });
    });
    return data;
  },
  // 加载商品数据
  loadGoodsAsync(accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          goods: { selectedOpt } // eslint-disable-line
        }
      } = getState();
      dispatch(this.loadGoods());
      const data = await this.requestGoods(accid, selectedOpt);
      dispatch(this.loadGoodsSuccess(data));
    };
  }
};

// ============================================================
// reducer
// ============================================================

// 商品列表
/**
 * 单个商品状态
 */
function singleGoods(state = { loading: false, data: [] }, action) {
  switch (action.type) {
    case types.LOAD_GOODS:
      return { ...state, loading: true };
    case types.LOAD_GOODS_SUCCESS:
      return {
        ...state,
        loading: false,
        receiveAt: action.receiveAt,
        page: 1,
        data: action.data
      };
    default:
      return state;
  }
}


export default singleGoods;
