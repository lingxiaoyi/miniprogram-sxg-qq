import { requestPdd, requestWithParameters } from '../../../utils/api';
import { minus, priceConversion } from '../../../utils/util';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // 商品列表（根据tab分类）
  CLEAR_THEME_LIST: 'CLEAR_THEME_LIST_pdd',
  LOAD_THEME_LIST: 'LOAD_THEME_LIST_pdd',
  LOAD_THEME_LIST_SUCCESS: 'LOAD_THEME_LIST_SUCCESS_pdd',
  LOADTHEMELISTSPECIALCATESUCCESS: 'LOADTHEMELISTSPECIALCATESUCCESS_pdd'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // 商品列表
  clearThemeList: () => ({
    type: types.CLEAR_THEME_LIST
  }),
  loadThemeList: () => ({
    type: types.LOAD_THEME_LIST,
    loading: true
  }),
  loadThemeListSuccess: (data = []) => ({
    type: types.LOAD_THEME_LIST_SUCCESS,
    data
  }),
  loadThemeListSpecialCateSuccess: data => ({
    type: types.LOADTHEMELISTSPECIALCATESUCCESS,
    data
  }),
  loadThemeListAsync(selectedOpt = 1, accid = '') {
    return async dispatch => {
      dispatch(this.loadThemeList());
      let data = [];
      const res = await requestPdd(URL.pdd.getGoodsBySubjectId, {
        sub_id: selectedOpt, // 专题id
        // cate_id: '', // 分类id
        accid
      });
      //console.log('res', res);
      const goodsList = res.data.data;

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

      dispatch(this.loadThemeListSuccess(data));
    };
  },
  loadThemeListSpecialCateAsync2(type = '2', specialId = '116') {
    //瓷片区内容
    return async dispatch => {
      dispatch(this.loadThemeList());
      let data = [];
      const res = await requestWithParameters(URL.specialCate, {
        type,
        specialId
      });
      // console.log('res****', res);
      const goodsList = res.data.special.spGoodsList[0].list;

      goodsList.forEach(gd => {
        const {
          goodsId,
          goodsTitle,
          goodsImg,
          purchaseNum,
          rebatePrice,
          originalPrice,
          couponPrice,
          earnSum,
          shopType
        } = gd;

        data.push({
          id: goodsId, // 商品ID
          name: goodsTitle, // 商品标题
          thumbnail: goodsImg, // 商品缩略图
          soldQuantity: purchaseNum, // 已售数量
          newPrice: rebatePrice, // 券后价
          oldPrice: originalPrice, // 原价
          coupon: couponPrice, // 优惠券金额
          commission: earnSum, // 佣金
          shopType: shopType === 1 ? 'tm' : 'tb', //商铺类型
          type: 'tb' //商铺类型
        });
      });
      let { backColor, spTitle, spImg } = res.data.special;
      dispatch(this.loadThemeListSpecialCateSuccess({ backColor, spTitle, spImg }));
      dispatch(this.loadThemeListSuccess(data));
    };
  },
  loadThemeListTbAsync(type = '1') {
    //9.9爆款
    return async (dispatch, getState) => {
      let { pagenum } = getState().home.themeList;
      let data = [];
      dispatch(this.loadThemeList());
      const res = await requestWithParameters(URL.highsalesvolumerank99, {
        type,
        pagenum
      });
      // console.log('res****', res);
      const goodsList = res.data.data;

      goodsList.forEach(gd => {
        let {
          itemid,
          guidearticle,
          itempic,
          itemsale,
          itemendprice,
          //originalPrice,
          couponmoney,
          commission,
          shoptype,
          itemshorttitle
        } = gd;
        if (commission === null) {
          commission = 0;
        } else {
          commission = commission.toFixed(2);
        }

        data.push({
          id: itemid, // 商品ID
          name: guidearticle || itemshorttitle, // 商品标题
          thumbnail: itempic, // 商品缩略图
          soldQuantity: priceConversion(itemsale), // 已售数量
          newPrice: itemendprice, // 券后价
          oldPrice: (itemendprice / 1 + couponmoney / 1).toFixed(2), // 原价
          coupon: couponmoney, // 优惠券金额
          commission: commission, // 佣金
          shopType: shoptype == 1 ? 'tm' : 'tb', //商铺类型
          type: 'tb' //商铺类型
        });
      });
      dispatch(this.loadThemeListSuccess(data));
    };
  },
  loadThemeListhighsalesvolumerankAsync(code = '1001') {
    return async dispatch => {
      dispatch(this.loadThemeList());
      let data = [];
      const res = await requestWithParameters(URL.highsalesvolumerank, {
        code
      });
      //.log('res****', res);
      const goodsList = res.data.data;

      goodsList.forEach(gd => {
        let {
          itemid,
          guidearticle,
          itempic,
          itemsale,
          itemendprice,
          //originalPrice,
          couponmoney,
          commission,
          shoptype
        } = gd;
        commission = commission.toFixed(2);
        data.push({
          id: itemid, // 商品ID
          name: guidearticle, // 商品标题
          thumbnail: itempic, // 商品缩略图
          soldQuantity: priceConversion(itemsale), // 已售数量
          newPrice: itemendprice, // 券后价
          oldPrice: itemendprice / 1 + couponmoney / 1, // 原价
          coupon: couponmoney, // 优惠券金额
          commission: commission, // 佣金
          shopType: shoptype == 1 ? 'tm' : 'tb', //商铺类型
          type: 'tb' //商铺类型
        });
      });
      //let { backColor, spTitle, spImg } = res.data.special;
      // dispatch(this.loadThemeListSpecialCateSuccess({ backColor, spTitle, spImg }));
      dispatch(this.loadThemeListSuccess(data));
    };
  },
  loadThemeListSpecialCateAsync(type = '2', specialId = '83') {
    return async dispatch => {
      dispatch(this.loadThemeList());
      const res = await requestWithParameters(URL.specialCate, {
        type,
        specialId
      });
      let { backColor, spTitle, spImg } = res.data.special;

      dispatch(this.loadThemeListSpecialCateSuccess({ backColor, spTitle, spImg }));
    };
  },
  requestHotGoods() {
    return async (dispatch, getState) => {
      let { pagenum } = getState().home.themeList;
      let res = {};
      let goodsList = [];
      // 实时热销榜
      res = await requestPdd(URL.pdd.topGoodsList, {
        page: pagenum
      });
      let data = [];
      goodsList = res.data.top_goods_list_get_response.list;
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
      dispatch(this.loadThemeListSuccess(data));
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
function themeList(state = { loading: false, data: [], option: {}, pagenum: 1 }, action) {
  switch (action.type) {
    case types.CLEAR_THEME_LIST:
      return { loading: false, data: [], option: {}, pagenum: 1 };
    case types.LOAD_THEME_LIST:
      return { ...state, loading: true };
    case types.LOAD_THEME_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        data: [...state.data, ...action.data],
        pagenum: ++state.pagenum
      };
    case types.LOADTHEMELISTSPECIALCATESUCCESS:
      return {
        ...state,
        loading: false,
        option: action.data,
        pagenum: ++state.pagenum
      };
    default:
      return state;
  }
}

export default themeList;
