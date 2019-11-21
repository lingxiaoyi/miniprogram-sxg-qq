import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD: 'MINE/BALANCEDETAIL/LOAD', // 请求中
  FAILED: 'MINE/BALANCEDETAIL/FAILED', // 请求失败
  SUCCESS: 'MINE/BALANCEDETAIL/SUCCESS',
  CLEAR: 'MINE/BALANCEDETAIL/CLEAR', //清空数据
  LOAD_FINISH: 'MINE/BALANCEDETAIL/FINISH' //加载完成
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  load: () => ({
    type: types.LOAD
  }),
  FAILED: msg => ({
    type: types.FAILED,
    msg
  }),
  SUCCESS: (data, startstr) => ({
    type: types.SUCCESS,
    data,
    startstr
  }),
  CLEAR: () => ({
    type: types.CLEAR
  }),
  loadFinish: (data, index) => ({
    type: types.LOAD_FINISH,
    data,
    index
  }),
  loadEarningsAsync() {
    return async (dispatch, getState) => {
      let publicParameters = await getPublicParameters();
      let { startstr, loading } = getState().mine.balancedetail;
      if (loading) return;
      dispatch(this.load());
      try {
        let res = await request(URL.getbalancedetail, { ...publicParameters, pagesize: 10, startstr }, 'get');
        if (res.data.stat === 0) {
          if (res.data.data.length) {
            dispatch(this.SUCCESS(res.data.data, res.data.startstr));
            if (res.data.data.length < 10) {
              dispatch(this.loadFinish('没有更多了哦~'));
            }
          } else {
            dispatch(this.loadFinish('没有更多了哦~'));
          }
        } else {
          dispatch(this.FAILED('请求失败'));
        }
      } catch (err) {
        dispatch(this.FAILED('网络错误'));
      }
    };
  }
};

// ============================================================
// reducer
// ============================================================
const INITIAL_STATE = {
  loading: false,
  loadFailed: false,
  loadFinish: false,
  failedMsg: '',
  pagesize: 1,
  startstr: '',
  data: [] //收益页面
};
const INITIAL_STATE_OLD = JSON.parse(JSON.stringify(INITIAL_STATE));
function mineBaseInfo(state = INITIAL_STATE, action) {
  // console.log('action>>', action);
  switch (action.type) {
    case types.LOAD: {
      return {
        ...state,
        loading: true
      };
    }
    case types.FAILED:
      return {
        ...state,
        loadFailed: true,
        failedMsg: action.msg,
        loading: false
      };
    case types.SUCCESS:
      return {
        ...state,
        loading: false,
        startstr: action.startstr,
        data: action.data
      };
    case types.LOAD_FINISH:
      return {
        ...state,
        loading: false,
        loadFinish: true
      };
    case types.CLEAR: {
      return {
        ...INITIAL_STATE_OLD
      };
    }
    default:
      return state;
  }
}

export default mineBaseInfo;
