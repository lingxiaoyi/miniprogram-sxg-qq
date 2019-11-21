import _isFunction from 'lodash/isFunction';
import Taro, { Component } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { getGlobalData } from '../../utils/wx';

import './titleBar.scss';

const backWhiteIcon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAkBAMAAACUH2ytAAAAFVBMVEUAAAD///////////////////////9Iz20EAAAABnRSTlMAgGqV9xA2Sb1hAAAAP0lEQVQY02OAARUBOJMpLRHOVktLC4ALpyUjCRsMOmEGt7QUuMPF0tLgPmJMS0sc/BIBCIlkBoSEAYLNysAAAEcHJLxne/uoAAAAAElFTkSuQmCC';
const backIcon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAkCAYAAABmMXGeAAAAAXNSR0IArs4c6QAAAMtJREFUSA3t1lEOgjAMBuAp0WePtPN4Cb2E98EHb0R8lb+Jv5lTtO36RNakWQbsYzRjMKT2OIK4IbfIazuXkoCPIk+taA0SP3jhJfDSQXUFeg1fi7wvG/Wq+dgc+C6vuIZSnAnJR2V7x7GNnPTEgEF7ZK4G79CXG7h2ckFHpMwqI8vIz44ZFlRiRIbBREPhEg2DazQE/oY2w0toE/wLdcP/UBesQc2wFjXBFlQNW1E1LBd64oxB3CrL1v3Xx0nUsPvTQ5At4TCQ8Nsjz64ZjPRrSj/0AAAAAElFTkSuQmCC';

class TitleBar extends Component {
  handleBackClick() {
    if (_isFunction(this.props.onBack)) {
      this.props.onBack();
    } else {
      const pages = Taro.getCurrentPages();
      if (pages.length >= 2) {
        Taro.navigateBack();
      } else {
        Taro.switchTab({
          url: '/pages/home/home'
        });
      }
    }
  }
  render() {
    const { statusBarHeight } = getGlobalData('system_info');
    const sbh = 2 * statusBarHeight;
    const bgColor =
      this.props.bgstyle === 'gray'
        ? '#f5f5f5'
        : this.props.bgstyle === 'black'
        ? '#111114'
        : this.props.bgstyle === 'transparent'
        ? 'transparent'
        : '#ffffff';
    const color = this.props.fontstyle === 'light' ? '#ffffff' : '#333333';
    const bgImage = `url(${this.props.fontstyle === 'light' ? backWhiteIcon : backIcon})`;
    const { bgCol, isOpenTb } = this.props;
    let logos = [
      'https://h5.suixingou.com/miniprogram-assets/sxgqq/logo-default.png',
      'https://h5.suixingou.com/miniprogram-assets/sxgqq/logo-tb.png'
    ];
    return (
      <View
        className='title-bar'
        style={`padding-top: ${Taro.pxTransform(sbh)}; background-color: ${bgCol || bgColor}; color: ${color}`}
      >
        {this.props.homePage ? (
          <View className='title-bar-home'>
            <View className='logo'>
              <Image
                className='icon'
                src={isOpenTb ? logos[1] : logos[0]}
                style={`width:${isOpenTb ? Taro.pxTransform(406) : Taro.pxTransform(329)}`}
              />
            </View>
            <View className='content'>{this.props.children}</View>
          </View>
        ) : (
          <View className='title-bar-others'>
            {!this.props.hideBack && (
              <View className='back' style={`background-image: ${bgImage}`} onClick={this.handleBackClick} />
            )}
            <View className='title'>{this.props.title || '魔性购'}</View>
          </View>
        )}
      </View>
    );
  }
}

// TitleBar.defaultProps = {
//   bgColor: '#ffffff',
//   color: '#333333'
// }

export default TitleBar;
