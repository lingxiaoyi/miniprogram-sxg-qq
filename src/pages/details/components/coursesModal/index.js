import Taro, { Component, useState, useEffect, useRef } from '@tarojs/taro';
import { View, Block, Image } from '@tarojs/components';
import './index.scss';
import { formatDate } from '../../../../utils/util';
import { getGlobalData } from '../../../../utils/wx';

/* class Dialog extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      showDialog: true
    };
  }
  componentDidMount() {
    this.showDialog();
  }
  showDialog() {
    let formatDay = formatDate(new Date(), 'yyyy-MM-dd');
    let showRedpackModal = Taro.getStorageSync('showDetailGuideDialog');
    if (!showRedpackModal || showRedpackModal.indexOf(formatDay) === -1) {
      Taro.setStorageSync('showDetailGuideDialog', formatDay);
      this.setState({
        showDialog: true
      });
    } else {
      this.setState({
        showDialog: false
      });
    }
  }
  render() {
    let { showDialog } = this.state;
    let { type } = this.props;
    let style = getGlobalData('system_info').isIpx ? `bottom: ${Taro.pxTransform(64 + 119)};` : '119rpx;';
    let style1 = type === 'tb' ? 'height:400rpx' : 'height:463rpx';
    return (
      <Block>
        {showDialog && (
          <View className='modal-wrapper'>
            <View className='modal' style={style + style1}>
              <Image
                className='pic'
                src={
                  type === 'tb'
                    ? 'https://h5.suixingou.com/miniprogram-assets/sxgqq/2.1.1/tb-guide.png'
                    : 'https://h5.suixingou.com/miniprogram-assets/sxgqq/2.1.1/xq-course.png'
                }
              />
              <View
                className='close'
                onClick={() => {
                  this.setState({ showDialog: false });
                }}
              />
            </View>
          </View>
        )}
      </Block>
    );
  }
} */
function Dialog({ type }) {
  const [showDialog, setShowDialog] = useState(0);
  useEffect(() => {
    console.log('showDialog', showDialog);
    let formatDay = formatDate(new Date(), 'yyyy-MM-dd');
    let showRedpackModal = Taro.getStorageSync('showDetailGuideDialog');
    if (!showRedpackModal || showRedpackModal.indexOf(formatDay) === -1) {
      Taro.setStorageSync('showDetailGuideDialog', formatDay);
      setShowDialog(() => 1);
    } else {
      setShowDialog(() => 0);
    }
  }, []);
  let style = getGlobalData('system_info').isIpx ? `bottom: ${Taro.pxTransform(64 + 119)};` : '119rpx;';
  let style1 = type === 'tb' ? 'height:400rpx' : 'height:463rpx';
  return (
    <Block>
      {showDialog && (
        <View className='modal-wrapper'>
          <View className='modal' style={style + style1}>
            <Image
              className='pic'
              src={
                type === 'tb'
                  ? 'https://h5.suixingou.com/miniprogram-assets/sxgqq/2.1.1/tb-guide.png'
                  : 'https://h5.suixingou.com/miniprogram-assets/sxgqq/2.1.1/xq-course.png'
              }
            />
            <View
              className='close'
              onClick={() => {
                setShowDialog(0);
              }}
            />
          </View>
        </View>
      )}
    </Block>
  );
}
export default Dialog;
