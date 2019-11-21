import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image, Block } from '@tarojs/components';
import './balance.scss';
import { jumpUrl, getGlobalData } from '../../../utils/wx';
import { formatDate } from '../../../utils/util';
import TitleBar from '../../../components/titleBar/titleBar';
import {
  earningsInfoActions,
  balancedetailActions,
  balanceWaitingAccountActions
} from '../../../redux/modules/mine/index';
import AtModal from '../../../components/modal/index';
import Loading from '../../../components/loading/loading';
import Nomore from '../../../components/baseNoMore';
import Log from '../../../utils/log';
import defaultImg from '../../../asset/default/160x160@3x.png';
import withLogin from '../../../components/wrappedComponent/withLogin.js';

@withLogin('didMount')
class Earnings extends Component {
  config = {
    navigationBarTitleText: '提现'
  };
  constructor() {
    super(...arguments);
    this.state = {
      showRuleModal: false,
      activeMenu: 'ddz'
    };
    this.timer = [];
  }

  async componentDidMount() {
    let { dispatch } = this.props;
    await dispatch(earningsInfoActions.loadEarningsAsync());
    this.onClickMenu(this.state.activeMenu);
    Log.click({ buttonfid: 'xq_10169' });
  }
  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(balancedetailActions.CLEAR());
    dispatch(balanceWaitingAccountActions.CLEAR());
    // 页面卸载时，清空数据
    this.timer.forEach(t => {
      clearTimeout(t);
      clearInterval(t);
    });
  }
  async onReachBottom() {
    this.onClickMenu(this.state.activeMenu);
  }
  async onClickMenu(type) {
    let { dispatch } = this.props;
    this.setState({
      activeMenu: type
    });
    if (type === 'ddz') {
      Log.click({ buttonfid: 'xq_10178' });
      await dispatch(balanceWaitingAccountActions.loadEarningsAsync()).then(() => {
        if (!this.intTimer) {
          this.intTimer = setInterval(() => {
            dispatch(balanceWaitingAccountActions.countDown());
          }, 1000);
          this.timer.push(this.intTimer);
        }
      });
    } else {
      await dispatch(balancedetailActions.loadEarningsAsync());
    }
  }
  handerInvite(item) {
    Log.click({ buttonfid: 'xq_10179' });
    let { tradeId, numIid, img, payPrice, itemTitle } = item;
    jumpUrl(
      `/pages/boost/boost?tradeId=${tradeId}&numIid=${numIid}&img=${encodeURIComponent(
        img
      )}&payPrice=${encodeURIComponent(payPrice)}&itemTitle=${encodeURIComponent(itemTitle)}`
    );
  }
  getCountDownTime(time) {
    // console.log(entTime, nowTime, time);
    var h = Math.floor((time / 1000 / 60 / 60) % 24);
    var m = Math.floor((time / 1000 / 60) % 60);
    var s = Math.floor((time / 1000) % 60);
    let o = {
      h: h.toString().length < 2 ? `0${h}` : h,
      m: m.toString().length < 2 ? `0${m}` : m,
      s: s.toString().length < 2 ? `0${s}` : s
    };
    return {
      h: o.h,
      m: o.m,
      s: o.s
    };
  }
  render() {
    let { showRuleModal, activeMenu } = this.state;
    const {
      balance = 0, //余额
      //incomeTotal = 0, //累计收益
      incomeNosettleCurrent = 0, //即将到账
      balancedetailData = [],
      loading,
      loadFinish,
      balanceWaitingAccount
    } = this.props;
    return (
      <View className='page-container'>
        <View className='main'>
          <View className='head-tips'>
            <View className='text'>每月25号后可提现上个月内确定收货的订单佣金</View>
          </View>
          <View className='sec1'>
            <View className='h3'>当前账户余额(元)</View>
            <View className='num'>{balance}</View>
            <View
              className='btn-withdrawal'
              onClick={() => {
                Log.click({ buttonfid: 'xq_10170' });
                jumpUrl('/pages/mine/withdraw/withdraw');
              }}
            >
              立即提现
            </View>
            <View className='h6'>即将到账:{incomeNosettleCurrent}元</View>
            <View
              className='btn-rule'
              onClick={() => {
                this.setState({ showRuleModal: true });
              }}
            >
              提现规则
            </View>
          </View>
          <View className='sec2'>
            <View className='menu'>
              <View className={activeMenu === 'ddz' ? 'li active' : 'li'} onClick={this.onClickMenu.bind(this, 'ddz')}>
                待到账
              </View>
              <View className={activeMenu === 'mx' ? 'li active' : 'li'} onClick={this.onClickMenu.bind(this, 'mx')}>
                余额明细
              </View>
            </View>
            {loading && <Loading />}
            {activeMenu === 'mx' && (
              <View className='ul'>
                {balancedetailData.map((item, i) => {
                  return (
                    <View className='li' key={i}>
                      <View className='info'>
                        <View className='text1'>{item.info}</View>
                        <View className='text2'>{formatDate(item.createtime, 'yyyy-MM-dd HH:mm')}</View>
                      </View>
                      <View className='h3'>{item.money}元</View>
                    </View>
                  );
                })}

                {loadFinish && <Nomore title='没有更多了哦~' />}
              </View>
            )}
            {activeMenu === 'ddz' && (
              <View className='ul-hb'>
                {balanceWaitingAccount.data.map(item => {
                  let {
                    createTime,
                    img,
                    tradeId,
                    payPrice,
                    totalCommission,
                    currentCommission,
                    itemTitle,
                    remainingTime,
                    currentBoostNum,
                    needBoostNum
                  } = item;
                  let isBoost = true; //是否应该助力
                  if (
                    item.tkStatus === 21 ||
                    item.tkStatus === 22 ||
                    item.tkStatus === 23 ||
                    item.tkStatus === 24 ||
                    currentBoostNum === needBoostNum
                  ) {
                    isBoost = false;
                  }

                  return (
                    <View className='li' key={tradeId}>
                      <View className='row1'>
                        <View className='price'>
                          <View className='span'>¥</View>
                          {totalCommission}
                        </View>
                        <View className='con'>
                          <View className='h3'>助力红包</View>
                          <View className='row-m'>
                            <View className='line'>
                              <View
                                className='line-active'
                                style={`width:${(currentCommission / totalCommission) * 100}%;`}
                              />
                            </View>
                            <View className='text'>
                              <View>
                                {currentBoostNum}/{needBoostNum}个好友已助力,
                              </View>
                              <View>已领取</View>
                              <View className='span'>{currentCommission}元</View>
                            </View>
                          </View>
                          <View className='countdown'>
                            {!isBoost ? (
                              <View className='text'>确认收货后可提现</View>
                            ) : (
                              <Block>
                                <View className='t'>{this.getCountDownTime(remainingTime).h}</View>:
                                <View className='t'>{this.getCountDownTime(remainingTime).m}</View>:
                                <View className='t'>{this.getCountDownTime(remainingTime).s}</View>
                                <View className='text'>后助力失败</View>
                              </Block>
                            )}
                          </View>
                          {isBoost && (
                            <View className='btn-invite' onClick={this.handerInvite.bind(this, item)}>
                              去邀请
                            </View>
                          )}
                        </View>
                      </View>
                      <View className='row2'>
                        <Image className='img' src={img || defaultImg} lazyLoad />
                        <View className='info'>
                          <View className='h3'>{itemTitle}</View>
                          <View className='h4'>{formatDate(createTime, 'yyyy-MM-dd HH:mm')}</View>
                        </View>
                      </View>
                    </View>
                  );
                })}

                {balanceWaitingAccount.loadFinish && <Nomore title='没有更多了哦~' />}
              </View>
            )}
          </View>
          <AtModal
            isOpened={showRuleModal}
            confirmText=' '
            onClose={() => {
              this.setState({ showRuleModal: false });
            }}
          >
            <Image
              className='img'
              src='https://h5.suixingou.com/miniprogram-assets/sxgqq/boost/balance-rule.png'
              onClick={() => {
                this.setState({ showRuleModal: false });
              }}
            />
          </AtModal>
        </View>
      </View>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state);
  const { data } = state.mine.earnings;
  const { loading, loadFailed, failedMsg, loadFinish, data: balancedetailData } = state.mine.balancedetail;
  const balanceWaitingAccount = state.mine.balanceWaitingAccount;
  return {
    loading,
    loadFailed,
    failedMsg,
    loadFinish,
    ...data,
    balancedetailData,
    balanceWaitingAccount
  };
}
export default connect(mapStateToProps)(Earnings);
