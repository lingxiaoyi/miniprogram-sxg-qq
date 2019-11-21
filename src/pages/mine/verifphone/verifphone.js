import Taro, { Component } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, getVerificationCode } from '../../../utils/wx';
import './verifphone.scss';
import { inviteInfoActions } from '../../../redux/modules/login/index';
import Log from '../../../utils/log';
import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';

let rules = {
  mobile(value) {
    if (!value) {
      this.showToast('请输入手机号');
      return false;
    }
    let bool = /^1[3456789]\d{9}$/.test(value);
    if (bool) {
      return true;
    } else {
      this.showToast('请输入正确的手机号');
      return false;
    }
  },
  testMobile(value) {
    let bool = /^1[3456789]\d{9}$/.test(value);
    return bool;
  },
  testVerifCode(value) {
    let bool = /^\d{4}$/.test(value);
    return bool;
  },
  verifCode(value) {
    if (!value) {
      this.showToast('请输入验证码');
      return false;
    }
    let bool = /^\d{4}$/.test(value);
    if (bool) {
      return true;
    } else {
      this.showToast('请输入正确的验证码');
      return false;
    }
  }
};
class Login extends Component {
  config = {
    navigationBarTitleText: '绑定手机号'
  };
  constructor() {
    super(...arguments);
    this.state = {
      inputPhone: '',
      inputCode: '',
      disabled: true,
      showBtnCode: true,
      time: 60,
      isConfirmBtnActive: false
    };
    this.timer = '';
  }
  componentWillReceiveProps(newProps) {
    if (newProps.inviterinfo.figureurl) {
      this.setState({
        disabled: false
      });
    } else {
      this.setState({
        disabled: true
      });
    }
  }
  componentDidMount() {
    Log.click({ buttonfid: 'xq_10145' }); // “获取验证码”按钮展现
    Log.click({ buttonfid: 'xq_10148' }); // “注册”按钮展现
  }
  componentWillUnmount() {
    //清空邀请人的信息
    let { dispatch } = this.props;
    dispatch(inviteInfoActions.loadClearAsync());
  }
  componentDidShow() {}

  componentDidHide() {}

  handlerInputPhone(e) {
    this.setState(
      {
        inputPhone: e.detail.value
      },
      this.changeConfirmBtnActive
    );
  }
  handlerInputCode(e) {
    this.setState(
      {
        inputCode: e.detail.value
      },
      this.changeConfirmBtnActive
    );
  }
  changeConfirmBtnActive() {
    let { inputPhone, inputCode } = this.state;
    if (rules.testMobile(inputPhone) && rules.testVerifCode(inputCode)) {
      this.setState({
        isConfirmBtnActive: true
      });
    } else {
      this.setState({
        isConfirmBtnActive: false
      });
    }
  }
  goNextStep() {
    //let params = this.$router.params;
    if (!this.state.inputText) {
      Taro.showToast({
        title: '请输入邀请码',
        icon: 'none',
        duration: 2000
      });
    } else {
      if (this.state.disabled) {
        Taro.showToast({
          title: '请输入正确的邀请码',
          icon: 'none',
          duration: 2000
        });
        return;
      }
    }
  }
  handleBackClick() {
    Taro.navigateBack();
  }
  async handlerGetCode() {
    Log.click({ buttonfid: 'xq_10146' });
    //获取验证码
    let { inputPhone, inputCode } = this.state;
    let bool = rules.mobile.call(this, inputPhone);
    if (bool) {
      let res = await getVerificationCode(inputPhone, inputCode);
      if (res.stat === 0) {
        this.setState({
          showBtnCode: false,
          time: 60
        });

        clearInterval(this.timer);
        this.timer = setInterval(() => {
          this.setState(
            prevstate => {
              time: prevstate.time--;
            },
            () => {
              if (this.state.time <= 0) {
                this.setState({
                  showBtnCode: true,
                  time: 60
                });
              }
            }
          );
        }, 1000);
      } else {
        Taro.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        });
      }
    }
  }
  async register(inputPhone, inputCode) {
    Log.click({ buttonfid: 'xq_10149' });
    //todo后期添加invitecode邀请码
    let publicParameters = await getPublicParameters();
    let res = await request(
      URL.bindingmobile,
      { ...publicParameters, mobile: inputPhone, verificationCode: inputCode },
      'get'
    );
    if (res.data.stat === 0) {
      this.handleBackClick();
    } else {
      Taro.showToast({
        title: res.data.msg,
        icon: 'none',
        duration: 2000
      });
      console.error('出错了!!!');
    }
  }
  onConfirm() {
    //第一步验证手机号和验证码
    let { inputPhone, inputCode } = this.state;
    rules.mobile.call(this, inputPhone) &&
      rules.verifCode.call(this, inputCode) &&
      this.register(inputPhone, inputCode);
  }
  showToast(msg) {
    Taro.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    });
  }
  render() {
    const { showBtnCode, time, isConfirmBtnActive } = this.state;
    return (
      <View className='page-container'>
        <View className='main'>
          <View className='h3'>
            <View className='text'>绑定手机号后，即可进行绑定手机号操作</View>
            <View className='close' />
          </View>
          <Input
            className='input'
            type='text'
            confirmType=''
            placeholder='请输入手机号'
            focus
            onInput={this.handlerInputPhone}
          />
          <View className='input-box'>
            <Input
              className='input'
              type='text'
              confirmType=''
              placeholder='请输入验证码'
              onInput={this.handlerInputCode}
            />
            <View className='right-box'>
              {showBtnCode && (
                <Text className='btn-get-code' onClick={this.handlerGetCode.bind(this)}>
                  获取验证码
                </Text>
              )}
              {!showBtnCode && <Text className='tips'>{time}s后重新获取</Text>}
            </View>
          </View>
          <View className={isConfirmBtnActive ? 'btn-confirm active' : 'btn-confirm'} onClick={this.onConfirm}>
            确认
          </View>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  //console.log('state>>', state);
  const { loading, loadFailed, failedMsg, inviterinfo } = state.login.inviteInfo;
  return {
    loading,
    loadFailed,
    failedMsg,
    inviterinfo
  };
}
export default connect(mapStateToProps)(Login);
