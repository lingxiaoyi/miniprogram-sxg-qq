import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD: 'MINE/BALANCEWAITINGACCOUNT/LOAD', // 请求中
  FAILED: 'MINE/BALANCEWAITINGACCOUNT/FAILED', // 请求失败
  SUCCESS: 'MINE/BALANCEWAITINGACCOUNT/SUCCESS',
  CLEAR: 'MINE/BALANCEWAITINGACCOUNT/CLEAR', //清空数据
  LOAD_FINISH: 'MINE/BALANCEWAITINGACCOUNT/FINISH', //加载完成
  COUNTDOWN: 'MINE/BALANCEWAITINGACCOUNT/COUNTDOWN' //倒计时
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
      let { pagenum, loading } = getState().mine.balanceWaitingAccount;
      if (loading) return;
      dispatch(this.load());
      try {
        let res = await request(URL.getarrivedorderlist, { ...publicParameters, pagesize: 10, pagenum }, 'get');
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
  },
  countDown: () => ({
    type: types.COUNTDOWN
  })
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
  pagenum: 1,
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
        pagenum: ++state.pagenum,
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
    case types.COUNTDOWN: {
      let arr = state.data.map(item => {
        return {
          ...item,
          remainingTime: item.remainingTime - 1000 >= 0 ? item.remainingTime - 1000 : 0
        };
      });
      return {
        ...state,
        data: arr
      };
    }
    default:
      return state;
  }
}

export default mineBaseInfo;
