import Taro, { Component } from '@tarojs/taro';
import { View, Input, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import './withdraw.scss';
import { earningsInfoActions } from '../../../redux/modules/mine/index';
import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
import Log from '../../../utils/log';

class DefaultComponent extends Component {
  config = {
    navigationBarTitleText: '提现'
  };

  constructor() {
    super(...arguments);
    this.state = {
      text: ''
    };
  }

  async componentDidMount() {
    let { dispatch } = this.props;
    await dispatch(earningsInfoActions.loadEarningsAsync());
  }
  componentWillUnmount() {}
  handlerInputText(e) {
    let value = e.detail.value;
    value = value.replace(/\D/g, '');
    this.setState({
      text: value
    });
  }
  onConfirm() {
    Log.click({ buttonfid: 'xq_10172' });
    let { text } = this.state;
    const { balance } = this.props.data;
    if (!text) {
      Taro.showToast({
        title: '请输入提现金额',
        icon: 'none',
        duration: 2000
      });
    } else if (text < 10) {
      Taro.showToast({
        title: '提现金额必须大于10元',
        icon: 'none',
        duration: 2000
      });
    } else if (text > balance) {
      Taro.showToast({
        title: '余额不足',
        icon: 'none',
        duration: 2000
      });
    } else {
      this.requestqqGateway(text);
    }
  }
  async requestqqGateway(money) {
    let publicParameters = await getPublicParameters();
    let res = await request(URL.qqGateway, { ...publicParameters, money }, 'get');
    if (res.data.stat === 0) {
      let { dispatch } = this.props;
      await dispatch(earningsInfoActions.loadEarningsAsync());
    } else if (res.data.stat === 3) {
      //请稍后操作
      Taro.showToast({
        title: '请等待10秒后重试',
        icon: 'none',
        duration: 2000
      });
    } else if (res.data.stat === 6) {
      //去注册手机号
      jumpUrl('/pages/mine/verifphone/verifphone');
    }
    if (res.data.stat === 3) {
      //请稍后操作
      Taro.showToast({
        title: '请等待10秒后重试',
        icon: 'none',
        duration: 2000
      });
    } else {
      Taro.showToast({
        title: res.data.msg,
        icon: 'none',
        duration: 2000
      });
    }
  }
  render() {
    const { balance } = this.props.data;
    const { nickname } = this.props.loginInfo;
    let { text } = this.state;
    return (
      <View className='page-container'>
        <View className='main'>
          <View className='logo'>
            <Image className='img' src='https://h5.suixingou.com/miniprogram-assets/sxgqq/boost/withdraw-logo.png' />
          </View>
          <View className='form'>
            <View className='row'>
              <View className='h3'>真实姓名</View>
              <View className='r active'>{nickname}</View>
            </View>
            <View className='row'>
              <View className='h3'>提现现金</View>
              <View className='r'>
                <Input
                  className='input'
                  type='number'
                  value={text}
                  confirmType=''
                  placeholder='请输入提现金额'
                  onInput={this.handlerInputText}
                  onClick={() => {
                    Log.click({ buttonfid: 'xq_10171' });
                  }}
                />
              </View>
            </View>
            <View className='row'>
              <View className='h3'>可提现金额</View>
              <View className='r'>¥{balance}</View>
            </View>
          </View>
          <View className='tips'>*每月25号后可提现上个月内确认收货的订单佣金，最 低提现金额10元</View>
          <View className='btn-confirm' onClick={this.onConfirm}>
            确认提现
          </View>
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
export default connect(mapStateToProps)(DefaultComponent);
