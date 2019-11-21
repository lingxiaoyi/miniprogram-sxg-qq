import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Button, Image, Ad } from '@tarojs/components';
import './mine.scss';
import { jumpUrl, getGlobalData } from '../../utils/wx';
import Log from '../../utils/log';
import { userInfoActions, earningsInfoActions } from '../../redux/modules/mine/index';
import TitleBar from '../../components/titleBar/titleBar';
import withLogin from '../../components/wrappedComponent/withLogin.js';
import AtModal from '../../components/modal/index';
//import Test from './test';

@withLogin('didMount')
class Mine extends Component {
  config = {
    navigationBarTitleText: '我的'
  };
  constructor() {
    super(...arguments);
    this.state = {
      showOpenedHbModal: false
    };
  }
  //空方法不能删除,不然WithLogin包装方法不能执行
  async componentDidMount() {
    let { dispatch } = this.props;
    await dispatch(earningsInfoActions.loadEarningsAsync());
  }
  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(userInfoActions.loadClearAsync());
  }
  async componentDidShow() {
    const wxThis = this.$scope;
    if (typeof wxThis.getTabBar === 'function' && wxThis.getTabBar()) {
      wxThis.getTabBar().setData({
        selected: 3
      });
    }
    //const { dispatch, userInfo } = this.props;
    //userInfo.accid && dispatch(userInfoActions.loadMineAsync());
  }
  loginSuccessCallback() {
    console.log('登陆成功');
    let { dispatch } = this.props;
    dispatch(earningsInfoActions.loadEarningsAsync());
    this.setState({ showOpenedHbModal: true });
  }
  /* async onPullDownRefresh() {
    const { dispatch } = this.props;
    await dispatch(userInfoActions.loadMineAsync());
    Taro.stopPullDownRefresh();
  } */
  gotoPage(url) {
    jumpUrl(url);
  }
  //点击客服
  handerClickService() {
    Log.click({ buttonfid: 'xq_10130' });
  }
  onShareAppMessage({ from }) {
    const myInvitecode = getGlobalData('myInvitecode');
    const othersInvitecode = getGlobalData('othersInvitecode');
    let ic = myInvitecode || othersInvitecode;
    const { nickname } = this.props.userInfo;
    const name = nickname || '您的好友';
    if (from === 'menu') {
      return {
        title: `${name}邀请您共享拼多多和京东购物省钱返利`,
        path: ic ? `pages/login/login?invitecode=${ic}` : 'pages/home/home',
        imageUrl: 'https://h5.suixingou.com/miniprogram-assets/sxgqq//share/poster_invite.jpg'
      };
    } else {
      return {
        title: `${name}邀请您共享拼多多和京东购物省钱返利`,
        path: `pages/login/login?invitecode=${ic || ''}`,
        imageUrl: 'https://h5.suixingou.com/miniprogram-assets/sxgqq//share/poster_invite.jpg'
      };
    }
  }
  render() {
    const {
      balance,
      incomeNosettleCurrent = 0 //即将到账
    } = this.props.data;
    const { figureurl, token, nickname } = this.props.loginInfo;
    const { showOpenedHbModal } = this.state;
    return (
      <View className='page-container'>
        <View className='main-wrapper'>
          {/* <Test initialCount={0}></Test> */}
          <View className='main'>
            <View className='sec1'>
              <View className='sec1-con'>
                <View className='head-img'>
                  <Image className='img' src={figureurl} />
                </View>
                <View className='info'>
                  <View className='row1'>
                    <View className='name'>{token ? nickname || '没有昵称' : '未登录'}</View>
                    {/*token && <View className='balance'>钱包余额:{balance}</View>*/}
                  </View>
                </View>
                {!token && (
                  <Button className='btn-confirm' openType='getUserInfo' onGetUserInfo={this.onAuthConfirmClick}>
                    登录
                  </Button>
                )}
              </View>
            </View>
            {token && (
              <View className='sec5'>
                <View
                  className='row'
                  onClick={() => {
                    jumpUrl('/pages/mine/order/order');
                  }}
                >
                  <Text className='icon-s i-order' />
                  <Text className='text'>我的订单</Text>
                  <Text className='icon' />
                </View>
                <View
                  className='row'
                  onClick={() => {
                    Log.click({ buttonfid: 'xq_10123' });
                    jumpUrl('/pages/mine/balance/balance');
                  }}
                >
                  <Text className='icon-s i-withdraw' />
                  <Text className='text'>可提现金额</Text>
                  <Text className='icon' />
                  <Text className='balance'>钱包余额:{balance}</Text>
                  <Text className='balance mr20'>即将到账:{incomeNosettleCurrent}</Text>
                </View>
              </View>
            )}

            <View className='ad'>
              <Ad unit-id='3c6646545dfc76d13593451c4314a696' />
            </View>
            <View className='sec-fill' />
          </View>
          {/* 红包弹窗2 */}
          <AtModal isOpened={showOpenedHbModal} confirmText=' '>
            <Image
              className='img'
              src='https://h5.suixingou.com/miniprogram-assets/sxgqq/boost/opened-hb.png'
              mode='widthFix'
              onClick={() => {
                this.setState({ showOpenedHbModal: false });
                jumpUrl(
                  `/pages/home/themeList/themeList?title=9.9包邮&id=11&bgcolor=#7a32e3&banner=${encodeURIComponent(
                    'https://h5.suixingou.com/miniprogram-assets/sxgqq/theme/99.png'
                  )}`
                );
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
  const { loading, loadFailed, data } = state.mine.earnings;
  const loginInfo = state.login.loginInfo;
  return {
    loading,
    loadFailed,
    data,
    loginInfo
  };
}

export default connect(mapStateToProps)(Mine);
