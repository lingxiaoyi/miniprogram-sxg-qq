import Taro, { Component } from '@tarojs/taro';
import { View, Image, Input } from '@tarojs/components';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData } from '../../../utils/wx';
import './orderretrieve.scss';

class Novice extends Component {
  config = {
    navigationBarTitleText: '订单找回',
    navigationBarTextStyle: 'white'
  };
  constructor() {
    super(...arguments);
    this.state = {};
  }

  // changeTabs(tabName) {
  //   this.setState({
  //     currentTab: tabName
  //   });
  // }
  // handlerInputCode(e) {
  //   this.setState({
  //     inputCode: e.detail.value
  //   });
  // }
  render() {
    return (
      <View className='page-container'>
        <View className='novice'>
          <View className='sec1'>
            <View className='h3'>订单编号找回</View>
            <View className='h4'>下单5分钟后，没有订单可以通过订单编号找回</View>
            <Input
              className='input'
              type='text'
              confirmType=''
              placeholder='请输入订单编号'
              // onInput={this.handlerInputCode}
            />
            <View className='btn-confirm'>立即找回</View>
          </View>
          <View className='sec2'>
            <Image
              className='img'
              mode='widthFix'
              src='https://h5.suixingou.com/miniprogram-assets/sxgqq/boost/order-retrieve.png'
            />
          </View>
        </View>
      </View>
    );
  }
}

export default Novice;
