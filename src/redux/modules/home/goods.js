import { requestPdd, requestJd, requestWithForm, requestWithParameters } from '../../../utils/api';
import { priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // 商品列表（根据tab分类）
  CHANGE_OPT: 'CHANGE_OPT',
  LOAD_GOODS: 'LOAD_GOODS',
  LOAD_GOODS_BY_SCROLL: 'LOAD_GOODS_BY_SCROLL',
  LOAD_GOODS_SUCCESS: 'LOAD_GOODS_SUCCESS',
  LOAD_GOODS_BY_SCROLL_SUCCESS: 'LOAD_GOODS_BY_SCROLL_SUCCESS',
  LOADCLEAR: 'LOAD_GOODS_CLEAR'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // tab切换
  changeOpt: opt => ({
    type: types.CHANGE_OPT,
    opt
  }),
  // 商品列表
  loadGoods: () => ({
    type: types.LOAD_GOODS,
    loading: true
  }),
  loadGoodsByScroll: () => ({
    type: types.LOAD_GOODS_BY_SCROLL,
    loadingByScroll: true
  }),
  loadGoodsSuccess: (data = []) => ({
    type: types.LOAD_GOODS_SUCCESS,
    receiveAt: Date.now(),
    data
  }),
  // 商品列表
  loadClear: () => ({
    type: types.LOADCLEAR
  }),
  loadGoodsByScrollSuccess: (data = [], page) => ({
    type: types.LOAD_GOODS_BY_SCROLL_SUCCESS,
    receiveAt: Date.now(),
    data,
    page
  }),
  // 加载商品数据
  loadPddGoodsAsync(accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          goods: { selectedOpt } // eslint-disable-line
        }
      } = getState();
      dispatch(this.loadGoods());
      //const data = await getPddData(accid, selectedOpt);
      const data = await getGoodsBySubjectId(accid, selectedOpt);
      dispatch(this.loadGoodsSuccess(data));
    };
  },
  loadTbGoodsAsync(categoryid) {
    return async dispatch => {
      dispatch(this.loadGoods());
      const data = await getTbData(categoryid);
      dispatch(this.loadGoodsSuccess(data));
    };
  },
  //爆款商品接口
  loadThemeListhighsalesvolumerankAsync(code = '1001') {
    return async dispatch => {
      dispatch(this.loadGoods());
      let data = [];
      const res = await requestWithParameters(URL.highsalesvolumerank, {
        code
      });
      console.log('res****', res);
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
      //let { backColor, spTitle, spImg } = res.data.special;
      // dispatch(this.loadThemeListSpecialCateSuccess({ backColor, spTitle, spImg }));
      dispatch(this.loadGoodsSuccess(data));
    };
  },
  getRank() {
    return async dispatch => {
      dispatch(this.loadGoods());
      const data = await getRankData();
      dispatch(this.loadGoodsSuccess(data));
    };
  }
};
/**
 * 获取淘宝搜索数据
 * @param {Object} param0
 */
async function getTbData(code = '1001') {
  let data = [];
  const res = await requestWithForm(URL.highsalesvolumerank, {
    code
  });
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
  return data;
}
async function getRankData(rankType = '1') {
  let data = [];
  const res = await requestPdd(URL.getRank, {
    rankType
  });
  const goodsList = res.data.data.data;
  goodsList.forEach(gd => {
    const { goodsId, pic, title, monthSales, originPrice, actualPrice, couponPrice, istmall, commissionRate } = gd;
    data.push({
      id: goodsId, // 商品ID
      name: title, // 商品标题
      thumbnail: pic, // 商品缩略图
      soldQuantity: priceConversion(monthSales), // 已售数量
      newPrice: actualPrice, // 券后价
      oldPrice: originPrice, // 原价
      coupon: couponPrice, // 优惠券金额
      commission: ((actualPrice * commissionRate) / 100).toFixed(2), // 佣金
      shopType: istmall === 0 ? 'tb' : 'tm', // 店铺类型（淘宝 or 天猫）
      type: 'tb' //商铺类型
    });
  });
  return data;
}
/**
 * 获取拼多多搜索数据
 * @param {Object} param0
 */
async function getPddData(accid = '', selectedOpt = 1) {
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
}
/**
 * 获取拼多多搜索数据
 * @param {Object} param0
 */
async function getGoodsBySubjectId(accid = '', selectedOpt = 1) {
  let data = [];
  const res = await requestPdd(URL.pdd.getGoodsBySubjectId, {
    sub_id: selectedOpt, // 专题id
    // cate_id: '', // 分类id
    accid
  });
  console.log('res', res);
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
  return data;
}
/**
 * 获取京东搜索数据
 * @param {Object} param0
 */
async function getJdData() {
  let data = [];
  const res = await requestJd(URL.jd.search, {});
  res.data.forEach(gd => {
    let {
      commissionInfo: { commission },
      couponInfo: { couponList },
      priceInfo: { price },
      inOrderCount30Days,
      skuName,
      skuId,
      thumb_img
    } = gd;
    const coupon = couponList.length > 0 ? couponList[0].discount : 0;
    data.push({
      id: skuId, // 商品ID
      name: skuName, // 商品标题
      thumbnail: thumb_img, // 商品缩略图
      soldQuantity: priceConversion(inOrderCount30Days), // 已售数量
      newPrice: minus(price, coupon), // 券后价
      oldPrice: price, // 原价
      coupon, // 优惠券金额
      commission: commission // 佣金
    });
  });
  return data;
}

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
    case types.LOAD_GOODS_BY_SCROLL:
      return { ...state, loadingByScroll: true };
    case types.LOAD_GOODS_SUCCESS:
      return {
        ...state,
        loading: false,
        receiveAt: action.receiveAt,
        page: 1,
        data: action.data
      };
    case types.LOAD_GOODS_BY_SCROLL_SUCCESS:
      return {
        ...state,
        loadingByScroll: false,
        receiveAt: action.receiveAt,
        page: action.page,
        data: [...state.data, ...action.data],
        noMore: !action.data.length
      };
    default:
      return state;
  }
}
/**
 * 按optid分类的商品状态
 */
function goodsByOpt(state = {}, action, selectedOpt) {
  switch (action.type) {
    case types.LOAD_GOODS:
    case types.LOAD_GOODS_BY_SCROLL:
    case types.LOAD_GOODS_SUCCESS:
    case types.LOAD_GOODS_BY_SCROLL_SUCCESS:
      return {
        ...state,
        [selectedOpt]: singleGoods(state[selectedOpt], action)
      };
    default:
      return state;
  }
}
/**
 * 商品状态
 */
function goods(
  state = {
    selectedOpt: 1,
    goodsByOpt: {}
  },
  action
) {
  // console.log()
  switch (action.type) {
    case types.CHANGE_OPT:
      return {
        ...state,
        selectedOpt: action.opt
      };
    case types.LOAD_GOODS:
    case types.LOAD_GOODS_BY_SCROLL:
    case types.LOAD_GOODS_SUCCESS:
    case types.LOAD_GOODS_BY_SCROLL_SUCCESS:
      return {
        ...state,
        goodsByOpt: goodsByOpt(state.goodsByOpt, action, state.selectedOpt)
      };
    case types.LOADCLEAR:
      return {
        selectedOpt: 1,
        goodsByOpt: {}
      };
    default:
      return state;
  }
}

export default goods;
