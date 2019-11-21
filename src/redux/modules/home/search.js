import { requestPdd, requestJd, requestWithParameters } from '../../../utils/api';
import { priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';
import { setGlobalData, getGlobalData } from '../../../utils/wx';
// ============================================================
// action types
// ============================================================
export const types = {
  // 商品列表（根据tab分类）
  CHANGE: 'MODULES/HOME/SEARCH/CHANGE',
  CHANGE_SORTTYPE: 'MODULES/HOME/SEARCH/CHANGE_SORTTYPE',
  RESET_SORTTYPE: 'MODULES/HOME/SEARCH/RESET_SORTTYPE',
  LOAD: 'MODULES/HOME/SEARCH/LOAD',
  CLEAR: 'MODULES/HOME/SEARCH/CLEAR',
  LOAD_BY_SCROLL: 'MODULES/HOME/SEARCH/LOAD_BY_SCROLL',
  LOAD_SUCCESS: 'MODULES/HOME/SEARCH/LOAD_SUCCESS',
  LOAD_BY_SCROLL_SUCCESS: 'MODULES/HOME/SEARCH/LOAD_BY_SCROLL_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // tab切换
  changeOpt: opt => ({
    type: types.CHANGE,
    opt
  }),
  changeSortType: sortType => ({
    type: types.CHANGE_SORTTYPE,
    sortType
  }),
  resetSortType: () => ({
    type: types.RESET_SORTTYPE
  }),
  // 商品列表
  load: () => ({
    type: types.LOAD,
    loading: true
  }),
  loadByScroll: () => ({
    type: types.LOAD_BY_SCROLL,
    loadingByScroll: true
  }),
  loadSuccess: (data = []) => ({
    type: types.LOAD_SUCCESS,
    receiveAt: Date.now(),
    data
  }),
  loadByScrollSuccess: (data = [], page) => ({
    type: types.LOAD_BY_SCROLL_SUCCESS,
    receiveAt: Date.now(),
    data,
    page
  }),
  clear: () => ({
    type: types.CLEAR
  }),
  // 加载商品数据
  loadAsync(kw, accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          search: { selectedOpt, sortType } // eslint-disable-line
        },
        mine: {
          userInfo: {
            data: { memberlevel }
          }
        }
      } = getState();
      dispatch(this.load());
      const data = await requestGoods({ kw, accid, selectedOpt, sortType, memberlevel });
      dispatch(this.loadSuccess(data));
    };
  },
  // 滚动加载商品数据（翻页）
  loadByScrollAsync(kw, accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          search: { goodsByOpt, selectedOpt, sortType } // eslint-disable-line
        },
        mine: {
          userInfo: {
            data: { memberlevel }
          }
        }
      } = getState();
      const { page } = goodsByOpt[selectedOpt];
      dispatch(this.loadByScroll());
      const data = await requestGoods({
        kw,
        accid,
        selectedOpt,
        sortType,
        page: page + 1,
        memberlevel
      });
      dispatch(this.loadByScrollSuccess(data, page + 1));
    };
  }
};

/**
 * 根据pdd排序字段整理出京东的排序字段
 * @param {Number} sortType 排序字段（参考pdd）
 */
function transformSortTypeForJd(sortType) {
  switch (sortType) {
    case 0:
      return {
        sortName: 'goodComments', // 综合-降序
        sort: 'desc'
      };
    case 1:
      return {
        sortName: 'commissionShare', // 佣金比例-升序
        sort: 'asc'
      };
    case 2:
      return {
        sortName: 'commissionShare', // 佣金比例-降序
        sort: 'desc'
      };
    case 3:
      return {
        sortName: 'price', // 价格-升序
        sort: 'asc'
      };
    case 4:
      return {
        sortName: 'price', // 价格-降序
        sort: 'desc'
      };
    case 5:
      return {
        sortName: 'inOrderCount30DaysSku', // 销量-升序
        sort: 'asc'
      };
    case 6:
      return {
        sortName: 'inOrderCount30DaysSku', // 销量-降序
        sort: 'desc'
      };
    default:
      return {
        sortName: 'goodComments', // 综合（好评率）-降序
        sort: 'desc'
      };
  }
}

/**
 * 根据pdd排序字段整理出淘宝的排序字段
 * @param {Number} sortType 排序字段（参考pdd）
 */
function transformSortTypeForTb(sortType) {
  switch (sortType) {
    case 0:
      // 综合-累计推广量降序
      return 601;
    case 1:
      // 佣金比例-升序
      return 202;
    case 2:
      // 佣金比例-降序
      return 201;
    case 3:
      // 价格-升序
      return 502;
    case 4:
      // 价格-降序
      return 501;
    case 5:
      // 销量-升序
      return 102;
    case 6:
      // 销量-降序
      return 101;
    default:
      // 综合-累计推广量降序
      return 601;
  }
}

/**
 * 获取淘宝搜索数据
 * @param {Object} param0
 */
async function getTbData({ kw, page, sortType, memberlevel }) {
  let data = [];
  const res = await requestWithParameters(URL.tb.search, {
    hotkey: kw, // encodeURIComponent(kw),
    /*
      101：销量降序
      102：销量升序
      201：预估佣金降序
      202：预估佣金升序
      501：价格降序
      502：价格升序
      601：累计推广量降序
      602：累计推广量升序
    */
    sortby: transformSortTypeForTb(sortType),
    isTmall: 0, // 是否是天猫商品。0或者不传：不限制；1：只拿天猫数据
    hascoupon: 0, // 是否有优惠券。0或者不传：不限制；1：只拿有优惠券数据
    freeShip: 0, // 是否包邮。0或者不传：不限制；1：只拿包邮数据
    pgno: page, // 第几页，默认1
    pgsize: 20, // 页大小，默认20，1~20
    passback: getGlobalData('tb_passback') || '', // 回传参数，接口返回值在下次调用时返回
    member_level: memberlevel // 用户等级（1：代理；2：超级会员）
  });
  // console.log('res>>>', res);
  setGlobalData('tb_passback', res.data.passback); // 回传参数（下一次请求时回传）
  const goodsList = res.data.goodslist;
  goodsList.forEach(gd => {
    const {
      goodsId,
      goodsTitle,
      goodsImg,
      purchaseNum,
      originalPrice,
      rebatePrice,
      couponPrice,
      earnSum,
      shopType
    } = gd;
    data.push({
      id: goodsId, // 商品ID
      name: goodsTitle, // 商品标题
      thumbnail: goodsImg, // 商品缩略图
      soldQuantity: priceConversion(purchaseNum), // 已售数量
      newPrice: rebatePrice, // 券后价
      oldPrice: originalPrice, // 原价
      coupon: couponPrice, // 优惠券金额
      commission: earnSum, // 佣金
      shopType: shopType === 0 ? 'tb' : 'tm' // 店铺类型（淘宝 or 天猫）
    });
  });
  return data;
}

/**
 * 获取拼多多搜索数据
 * @param {Object} param0
 */
async function getPddData({ kw, accid, sortType, page }) {
  let data = [];
  const res = await requestPdd(URL.pdd.search, {
    keyword: encodeURIComponent(kw),
    accid,
    // 0-综合排序;1-按佣金比率升序;2-按佣金比例降序;3-按价格升序;4-按价格降序;5-按销量升序;6-按销量降序;
    sort_type: sortType,
    page
  });
  const goodsList = res.data.goods_search_response.goods_list;
  goodsList.forEach(gd => {
    const {
      goods_id,
      goods_name,
      goods_thumbnail_url,
      sold_quantity,
      min_group_price,
      coupon_discount,
      promotion_rate
    } = gd;

    data.push({
      id: goods_id, // 商品ID
      name: goods_name, // 商品标题
      thumbnail: goods_thumbnail_url, // 商品缩略图
      soldQuantity: priceConversion(sold_quantity), // 已售数量
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
async function getJdData({ kw, accid, sortType, page }) {
  let data = [];
  const { sortName, sort } = transformSortTypeForJd(sortType);
  const res = await requestJd(URL.jd.search, {
    keyword: encodeURIComponent(kw),
    sortName,
    sort,
    page,
    accid
  });
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

async function requestGoods({ kw, accid = '', selectedOpt, page = 1, sortType = 0, memberlevel = '' }) {
  let data = [];
  // const isPdd = selectedOpt === 'pdd';
  try {
    if (selectedOpt === 'tb') {
      data = await getTbData({ kw, page, sortType, memberlevel });
    } else if (selectedOpt === 'pdd') {
      data = await getPddData({ kw, accid, sortType, page });
    } else {
      data = await getJdData({ kw, accid, sortType, page });
    }
    return data;
  } catch (e) {
    console.error('error: ', e);
    return data;
  }
}

// ============================================================
// reducer
// ============================================================

// 商品列表
/**
 * 单个商品状态
 */
function singleGoods(state = { loading: false, page: 1, noMore: false, data: [] }, action) {
  switch (action.type) {
    case types.LOAD:
      return { ...state, loading: true };
    case types.LOAD_BY_SCROLL:
      return { ...state, loadingByScroll: true };
    case types.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        receiveAt: action.receiveAt,
        page: 1,
        data: action.data
      };
    case types.LOAD_BY_SCROLL_SUCCESS:
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
    case types.LOAD:
    case types.LOAD_BY_SCROLL:
    case types.LOAD_SUCCESS:
    case types.LOAD_BY_SCROLL_SUCCESS:
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
function search(
  state = {
    selectedOpt: 'tb',
    sortType: 0,
    goodsByOpt: {}
  },
  action
) {
  // console.log()
  switch (action.type) {
    case types.CHANGE:
      return {
        ...state,
        selectedOpt: action.opt
      };
    case types.CHANGE_SORTTYPE:
      return {
        ...state,
        sortType: action.sortType
      };
    case types.RESET_SORTTYPE:
      return {
        ...state,
        sortType: 0
      };
    case types.CLEAR:
      return {
        selectedOpt: 'tb',
        sortType: 0,
        goodsByOpt: {}
      };
    case types.LOAD:
    case types.LOAD_BY_SCROLL:
    case types.LOAD_SUCCESS:
    case types.LOAD_BY_SCROLL_SUCCESS:
      return {
        ...state,
        goodsByOpt: goodsByOpt(state.goodsByOpt, action, state.selectedOpt)
      };
    default:
      return state;
  }
}

export default search;
