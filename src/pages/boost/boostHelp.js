import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image, Text, Button } from '@tarojs/components';
import TitleBar from '../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../utils/wx';
import withLogin from '../../components/wrappedComponent/withLogin';
import './boost.scss';
import Log from '../../utils/log';
import GoodsList from './goods/goodsList';
import Loading from '../../components/loading/loading';
import { goodsActions, boostStatusActions, boostHelpActions } from '../../redux/modules/boost';
import AtModal from '../../components/modal/index';

@withLogin('didMount')
class HotGoods extends Component {
  config = {
    navigationBarTitleText: ''
  };

  constructor() {
    super(...arguments);
    this.state = {
      title: '好友助力领现金',
      selectedOpt: 'pdd',
      showRuleModal: false,
      countDown: 0,
      img: '',
      payPrice: 0,
      itemTitle: '',
      figureurl: '',
      nickname: '',
      showZlhbModal: false,
      showZlhbNewModal: false
    };
    this.timer = [];
  }

  componentDidMount() {
    const { dispatch, loginInfo } = this.props;
    const { accid } = loginInfo;
    const {
      tradeId = '190614-024330568871807',
      numIid = '4586203646',
      img,
      payPrice,
      itemTitle,
      figureurl,
      nickname
    } = this.$router.params;
    this.setState({
      img,
      payPrice,
      itemTitle,
      figureurl,
      nickname
    });
    dispatch(goodsActions.loadGoodsAsync(accid));
    dispatch(boostStatusActions.loadDataAsync(tradeId, numIid));
    Log.click({ buttonfid: 'xq_10175' });
  }

  componentWillUnmount() {
    // 页面卸载时，清空数据
    this.timer.forEach(t => {
      clearTimeout(t);
      clearInterval(t);
    });
  }
  componentWillReceiveProps(props) {
    if (props.boostStatus.data.remainingTime) {
      this.countDown();
    }
  }
  loginSuccessCallback() {
    this.confirmBoost('first');
  }
  handleGoodsClick(goodsId) {
    Log.click({ buttonfid: 'xq_10177' });
    jumpUrl(`/pages/details/pdd/pdd?id=${goodsId}`);
  }
  confirmBoost(type) {
    Log.click({ buttonfid: 'xq_10176' });
    const { dispatch, loginInfo } = this.props;
    const { accid, figureurl } = loginInfo;
    const { tradeId = '190614-024330568871807', numIid = '4586203646' } = this.$router.params;
    dispatch(boostHelpActions.loadDataAsync(tradeId, numIid, accid, encodeURIComponent(figureurl))).then(() => {
      dispatch(boostStatusActions.loadDataAsync(tradeId, numIid)).then(() => {
        Taro.showToast({
          title: this.props.boostHelp.data.msg,
          icon: 'none',
          duration: 2000
        });
      });
      if (this.props.boostHelp.data.data) {
        if (type === 'first') {
          this.setState({
            showZlhbNewModal: true
          });
        } else {
          this.setState({
            showZlhbModal: true
          });
        }
      }
    });
  }
  countDown() {
    if (!this.intTimer) {
      this.intTimer = setInterval(() => {
        //if (this.state.countDown <= 0) return;
        if (!this.state.countDown) {
          this.setState({
            countDown: this.props.boostStatus.data.remainingTime
          });
        } else if (this.state.countDown <= 0) {
          return;
        } else {
          this.setState(prev => ({
            countDown: prev.countDown - 1000
          }));
        }
      }, 1000);
      this.timer.push(this.intTimer);
    }
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
    return `${o.h}:${o.m}:${o.s}`;
  }
  onShareAppMessage() {
    const { img, payPrice, itemTitle, figureurl, nickname } = this.state;
    const { tradeId = '190614-024330568871807', numIid = '4586203646' } = this.$router.params;
    return {
      title: `就差你一刀啦，爱你哦～`,
      path: `/pages/boost/boostHelp?tradeId=${tradeId}&numIid=${numIid}&img=${img}&payPrice=${payPrice}&itemTitle=${itemTitle}&figureurl=${figureurl}&nickname=${nickname}`,
      imageUrl: 'https://h5.suixingou.com/miniprogram-assets/sxgqq/2.1.1/boost-share.png'
    };
  }
  render() {
    const {
      title,
      selectedOpt,
      showRuleModal,
      countDown,
      img,
      payPrice,
      itemTitle,
      figureurl,
      nickname,
      showZlhbModal,
      showZlhbNewModal
    } = this.state;
    const { goodsList, loading, boostStatus, loginInfo } = this.props;
    const { accid } = loginInfo;
    const {
      boosterList = [],
      currentBoostNum,
      currentCommission,
      needBoostNum,
      remainingTime,
      totalCommission
    } = boostStatus.data;
    let barPercentage = currentCommission / totalCommission;
    barPercentage = barPercentage >= 0.2 ? barPercentage : 0.2;
    let isBoostFinsh = false;
    if (currentBoostNum === needBoostNum || remainingTime == 0) {
      isBoostFinsh = true;
    }

    return (
      <View className='page-container'>
        <View className='main'>
          <View className='sec1'>
            <View
              className='rule'
              onClick={() => {
                this.setState({ showRuleModal: true });
              }}
            />
            <View className='h4'>
              邀请 <Text className='span'>{needBoostNum}</Text>位好友助力 , 拿全额提现
            </View>
            <View className='block block-help'>
              <View className='person'>
                <Image className='img' src={decodeURIComponent(figureurl)} />
                <View className='info'>
                  <View className='info-h4'>{decodeURIComponent(nickname)}</View>
                  <View className='info-h3'>
                    购物后还能<Text className='span'>领现金</Text> , 特请兄弟帮忙助力
                  </View>
                </View>
              </View>
              <View className='goods'>
                <Image className='img' src={decodeURIComponent(img)} />
                <View className='info'>
                  <View className='info-h3'>{decodeURIComponent(itemTitle)}</View>
                  <View className='info-h2'>
                    <Text className='span'>￥</Text>
                    {decodeURIComponent(payPrice)}
                  </View>
                </View>
              </View>
              <View className='process-w'>
                <View className='row1'>
                  <View className='bar'>
                    <View className='bar-active' style={'width:' + barPercentage * 100 + '%'}>
                      {currentCommission && currentCommission.toFixed(2)}元
                    </View>
                  </View>
                </View>
                <View className='row2 clearfix'>
                  <View className='l'>0元</View>
                  <View className='r'>{totalCommission}元</View>
                </View>
              </View>
              <View className={isBoostFinsh ? 'btn-boost btn-boost-invite boost-finsh' : 'btn-boost btn-boost-invite'}>
                <View className='boost' onClick={this.confirmBoost} />
                {!accid && (
                  <Button className='btn' openType='getUserInfo' onGetUserInfo={this.onAuthConfirmClick.bind(this)} />
                )}
              </View>
              {!isBoostFinsh && <View className='time-out'>还剩{this.getCountDownTime(countDown)} 过期，快来助力</View>}
              <View className='users'>
                <View className='ul'>
                  {boosterList.map(item => {
                    let { boosterId, avatarUrl, boostMoney } = item;
                    return (
                      <View className='li' key={boosterId}>
                        <Image className='img' src={decodeURIComponent(avatarUrl)} />
                        <View className='text'>+{boostMoney}</View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
          <View className='sec2'>
            <View className='title' />
            {loading && goodsList && goodsList.length === 0 && <Loading />}
            {goodsList && goodsList.length > 0 && (
              <GoodsList
                goodsList={goodsList}
                union={selectedOpt}
                onClick={gds => {
                  if (selectedOpt === 'pdd') {
                    jumpUrl(`/pages/details/pdd/pdd?id=${gds.id}`);
                  } else {
                    jumpUrl(`/pages/details/jd/jd?id=${gds.id}`);
                  }
                }}
              />
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
              src='https://h5.suixingou.com/miniprogram-assets/sxgqq/boost/rule.png'
              mode='widthFix'
              onClick={() => {
                this.setState({ showRuleModal: false });
              }}
            />
            <View
              className='btn-close'
              onClick={() => {
                this.setState({ showRuleModal: false });
              }}
            />
          </AtModal>
          <AtModal
            isOpened={showZlhbModal}
            confirmText=' '
            onClose={() => {
              this.setState({ showZlhbModal: false });
            }}
          >
            <Image
              className='img'
              src='https://h5.suixingou.com/miniprogram-assets/sxgqq/2.1.1/zlhb.png'
              mode='widthFix'
              onClick={() => {
                this.setState({ showZlhbModal: false });
              }}
            />
            <View className='zlhb-text'>
              <Text className='span'>￥</Text>
              {this.props.boostHelp.data.data}
            </View>
          </AtModal>
          <AtModal
            isOpened={showZlhbNewModal}
            confirmText=' '
            onClose={() => {
              this.setState({ showZlhbNewModal: false });
            }}
          >
            <Image
              className='img'
              src='https://h5.suixingou.com/miniprogram-assets/sxgqq/2.1.1/zlhb-new.png'
              mode='widthFix'
              onClick={() => {
                this.setState({ showZlhbNewModal: false });
              }}
            />
            <View className='zlhb-new-text'>已为好友成功助力￥{this.props.boostHelp.data.data}</View>
          </AtModal>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { boostRecommend, boostStatus, boostHelp } = state.boost;
  const { loading, data: goodsList } = boostRecommend;
  const { loginInfo } = state.login;
  return {
    goodsList,
    loading,
    loginInfo,
    boostStatus,
    boostHelp
  };
}

export default connect(mapStateToProps)(HotGoods);
