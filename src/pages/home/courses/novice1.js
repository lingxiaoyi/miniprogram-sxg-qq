import Taro, { Component } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData } from '../../../utils/wx';

import './novice.scss';

class Novice extends Component {
  config = {
    navigationBarTitleText: '购物教程',
    navigationBarTextStyle: 'white'
  };
  constructor() {
    super(...arguments);
    this.state = {
      currentTab: 'pdd'
    };
  }

  changeTabs(tabName) {
    this.setState({
      currentTab: tabName
    });
  }

  render() {
    // https://h5.suixingou.com/miniprogram-assets/sxgqq/home/courses/jd_01.jpg
    const { currentTab } = this.state;
    return (
      <View className='page-container'>
        <View className='novice'>
          {/* <TitleBar title='购物教程' /> */}
          {/* <View className='tabs' style>
          <View
            className={`tab ${currentTab === 'pdd' ? 'tab-pdd active' : 'tab-pdd'}`}
            onClick={this.changeTabs.bind(this, 'pdd')}
          >
            拼多多教程
          </View>
          <View
            className={`tab ${currentTab === 'jd' ? 'tab-jd active' : 'tab-jd'}`}
            onClick={this.changeTabs.bind(this, 'jd')}
          >
            京东教程
          </View>
        </View> */}
          <View className='course'>
            {currentTab === 'pdd' ? (
              <View className='course-pdd'>
                <Image
                  className='img'
                  mode='widthFix'
                  src='https://h5.suixingou.com/miniprogram-assets/sxgqq/qq/shopping-s1.png'
                />
                <Image
                  className='img'
                  mode='widthFix'
                  src='https://h5.suixingou.com/miniprogram-assets/sxgqq/qq/shopping-s2.png'
                />
                <Image
                  className='img'
                  mode='widthFix'
                  src='https://h5.suixingou.com/miniprogram-assets/sxgqq/qq/shopping-s3.png'
                />
              </View>
            ) : (
              <View className='course-jd'>
                <Image
                  className='img'
                  mode='widthFix'
                  src='https://h5.suixingou.com/miniprogram-assets/sxgqq/home/courses/jd_01.jpg'
                />
                <Image
                  className='img'
                  mode='widthFix'
                  src='https://h5.suixingou.com/miniprogram-assets/sxgqq/home/courses/jd_02.jpg'
                />
                <Image
                  className='img'
                  mode='widthFix'
                  src='https://h5.suixingou.com/miniprogram-assets/sxgqq/home/courses/jd_03.jpg'
                />
              </View>
            )}
          </View>
          {/* <View className='btn-wrap'>
          <View
            className='btn'
            onClick={() => {
              Taro.switchTab({ url: '/pages/home/home' });
            }}
          >
            立即分享赚钱
          </View>
        </View> */}
        </View>
      </View>
    );
  }
}

export default Novice;
