import Taro, { Component } from '@tarojs/taro';
import { View, Button, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './login.scss';
import { getGlobalData } from '../../utils/wx';
import TitleBar from '../../components/titleBar/titleBar';
import { inviteInfoActions } from '../../redux/modules/login/index';
import Log from '../../utils/log';
import headImg from '../../asset/mine/head.png';
import withLogin from '../../components/wrappedComponent/withLogin.js';

@withLogin('didMount')
class Login extends Component {
  config = {
    navigationBarTitleText: '授权登录'
  };
  constructor() {
    super(...arguments);
    this.state = { showSkip: false };
  }
  async componentDidMount() {
    const { dispatch, token } = this.props;
    let invitecode = getGlobalData('othersInvitecode');
    if (invitecode) {
      await dispatch(inviteInfoActions.loadInviterinfoAsync(invitecode));
      //如果是页面路由只有1个并且有邀请码显示跳过按钮
      this.setState({
        showSkip: true
      });
      // Log.click({ buttonfid: 'x_10140' });
    }
    if (token) {
      this.skipNextPage();
    }
  }
  componentDidShow() {
    const { token } = this.props;
    if (token) {
      this.skipNextPage();
    }
  }
  loginSuccessCallback() {
    const { token } = this.props;
    if (token) {
      this.skipNextPage();
    }
  }
  componentWillUnmount() {
    //清空邀请人的信息
    let { dispatch } = this.props;
    dispatch(inviteInfoActions.loadClearAsync());
  }
  /* async onAuthConfirmClick() {
    Log.click({ buttonfid: 'x_10141' });
  } */
  skipNextPage(value) {
    Taro.switchTab({ url: '/pages/home/home' });
    if (value === 'log') {
      //这个值相等的时候才上报  点击跳过按钮
      Log.click({ buttonfid: 'x_10142' });
    }
  }
  render() {
    const { inviterinfo, loading } = this.props;
    return (
      <View className='page-container'>
        <View className='main'>
          <View className='sec1 invite'>
            <Image className='img-banner' src='https://h5.suixingou.com/miniprogram-assets/sxgqq/mine/login-bg.png' />
            {this.state.showSkip && inviterinfo.figureurl && (
              <View className='sec'>
                <Image className='img-head' src={inviterinfo.figureurl || headImg} />
                <Text className='text'>邀请人 {inviterinfo.nickname}</Text>
              </View>
            )}
          </View>
          <View className='sec2'>
            <Button
              /* disabled={loading} */ loading={loading}
              className='btn-confirm'
              openType='getUserInfo'
              onGetUserInfo={this.onAuthConfirmClick}
            >
              授权登陆
            </Button>
            {this.state.showSkip && (
              <View className='btn-skip' onClick={this.skipNextPage.bind('log')}>
                暂不注册
              </View>
            )}
          </View>
          <Text className='bottom-tips'>完成注册，享受购物省钱返利</Text>
        </View>
      </View>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state);
  const { loadFailed, failedMsg, inviterinfo } = state.login.inviteInfo;
  const { loading, token } = state.login.loginInfo;
  return {
    loading,
    loadFailed,
    failedMsg,
    inviterinfo,
    token
  };
}
export default connect(mapStateToProps)(Login);
