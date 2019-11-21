import { requestWithForm } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD_GOODS: 'boostStatus/LOAD',
  LOAD_GOODS_SUCCESS: 'boostStatus/SUCCESS',
  LOAD_CLEAR: 'boostStatus/CLEAR' //清空数据
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
  loadClear: () => ({
    type: types.LOAD_CLEAR
  }),
  // 加载商品数据
  loadDataAsync(tradeId, numIid) {
    return async dispatch => {
      dispatch(this.loadGoods());
      const res = await requestWithForm(URL.boostingProgress, {
        tradeId,
        numIid
      });
      dispatch(this.loadGoodsSuccess(res.data.data));
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
const INITIAL_STATE = { loading: false, data: [] };
const INITIAL_STATE_OLD = JSON.parse(JSON.stringify(INITIAL_STATE));
function boostStatus(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.LOAD_GOODS:
      return { ...state, loading: true };
    case types.LOAD_GOODS_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    case types.LOAD_CLEAR: {
      return {
        ...INITIAL_STATE_OLD
      };
    }
    default:
      return state;
  }
}

export default boostStatus;
