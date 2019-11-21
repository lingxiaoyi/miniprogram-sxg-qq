import { combineReducers } from 'redux';
import boostRecommend, { actions as goodsActions } from './boost';
import boostStatus, { actions as boostStatusActions } from './boostStatus';
import boostHelp, { actions as boostHelpActions } from './boostHelp';

// export default combineReducers({ goodsDetails, recommend });
export default combineReducers({
  boostRecommend,
  boostStatus,
  boostHelp
});

export {
  goodsActions,
  boostStatusActions,
  boostHelpActions
};
