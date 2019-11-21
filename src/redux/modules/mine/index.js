import { combineReducers } from 'redux';
import userInfo, { actions as userInfoActions } from './userInfo'
import earnings, { actions as earningsInfoActions } from './earnings';
import order, { actions as orderInfoActions } from './order';
import balancedetail, { actions as balancedetailActions } from './balancedetail'
import balanceWaitingAccount, { actions as balanceWaitingAccountActions } from './balanceWaitingAccount'

export default combineReducers({ userInfo, earnings, order, balancedetail, balanceWaitingAccount });

export {
  userInfoActions,
  earningsInfoActions,
  orderInfoActions,
  balancedetailActions,
  balanceWaitingAccountActions
};
