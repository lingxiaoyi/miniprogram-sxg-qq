import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image } from '@tarojs/components';
import './order.scss';
import { orderInfoActions } from '../../../redux/modules/mine/index';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import { throttle, formatDate } from '../../../utils/util';
import Nomore from '../../../components/baseNoMore';
import Nodata from '../../../components/baseNoData';
import Loading from '../../../components/loading/loading';
import defaultImg from '../../../asset/default/160x160@3x.png';
import withLogin from '../../../components/wrappedComponent/withLogin.js';
import Log from '../../../utils/log';

@withLogin('didMount')
class Order extends Component {
  config = {
    navigationBarTitleText: '我的订单',
    enablePullDownRefresh: true
  };
  constructor() {
    super(...arguments);
    this.state = {
      currentTab: 0, //当前栏目
      currentFilterData: [], //当前过滤索引
      showPromt: true,
      isFixed: false,
      showOrderType: false,
      showJc: false
    };
    this.top = 0;
    this.distance = '';
  }
  async componentDidMount() {
    let { dispatch } = this.props;
    //判断上方提示框,关闭之后不显示
    let orderShowPromt = Taro.getStorageSync('orderShowPromt');
    if (orderShowPromt) {
      this.setState({
        showPromt: false
      });
    } else {
      this.setState({
        showPromt: true
      });
    }
    await dispatch(orderInfoActions.loadOrderListAsync(0, this.state.currentFilterData, this.orderSourceType));
    this.setState({
      showJc: true
    });
    this.initthrottle = throttle(obj => {
      //节流函数 防止执行太快
      if (obj.scrollTop >= this.distance) {
        this.setState({
          isFixed: true,
          showOrderType: false
        });
      } else {
        this.setState({
          isFixed: false
        });
      }
    }, 160);

    const query = Taro.createSelectorQuery();
    this.windowHeight = Taro.getSystemInfoSync().windowHeight;
    query
      .select('.ul-tab-h')
      .boundingClientRect(rect => {
        this.distance = rect.top; //获取元素的高度
        this.top = rect.top;
      })
      .exec();
  }

  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(orderInfoActions.loadClearAsync());
  }
  async onPullDownRefresh() {
    let { dispatch } = this.props;
    dispatch(orderInfoActions.loadClearAsync());
    await dispatch(
      orderInfoActions.loadOrderListAsync(this.state.currentTab, this.state.currentFilterData, this.orderSourceType)
    );
    Taro.stopPullDownRefresh();
  }
  onPageScroll(obj) {
    this.initthrottle(obj);
  }
  async onReachBottom() {
    let { dispatch } = this.props;
    await dispatch(
      orderInfoActions.loadOrderListAsync(this.state.currentTab, this.state.currentFilterData, this.orderSourceType)
    );
    let { failedMsg, loadFailed } = this.props;
    if (loadFailed) {
      Taro.showToast({
        title: failedMsg,
        icon: 'none',
        duration: 2000
      });
    }
  }
  async handlerTabsHClick(i) {
    this.setState({
      currentTab: i
    });
    let { orderlist, dispatch } = this.props;
    let length = orderlist[i].data.length;
    if (length === 0) {
      await dispatch(orderInfoActions.loadOrderListAsync(i, this.state.currentFilterData, this.orderSourceType));
    }
    if (i === 1) {
      Log.click({ buttonfid: 'xq_10181' });
    }
  }
  handlerHidePrompt() {
    this.setState(
      {
        showPromt: false
      },
      () => {
        Taro.setStorageSync('orderShowPromt', 1);
      }
    );
  }
  copyTradeId(id) {
    Taro.setClipboardData({ data: id })
      .then(() => {
        Taro.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000
        });
      })
      .catch(() => {
        Taro.showToast({
          title: '复制失败',
          icon: 'fail',
          duration: 2000
        });
      });
  }
  //显示订单栏
  handlerShowOrderType() {
    this.setState({
      showOrderType: !this.state.showOrderType
    });
  }
  handerInvite(item) {
    Log.click({ buttonfid: 'xq_10181' });
    let { tradeId, numIid, img, payPrice, itemTitle } = item;
    jumpUrl(
      `/pages/boost/boost?tradeId=${tradeId}&numIid=${numIid}&img=${encodeURIComponent(
        img
      )}&payPrice=${encodeURIComponent(payPrice)}&itemTitle=${encodeURIComponent(itemTitle)}`
    );
  }
  render() {
    let { currentTab, isFixed } = this.state;
    let { orderlist, loading } = this.props;
    let tabsH = ['全部', '待助力', '待收货', '已收货'];
    let ulHtml = null;
    let length = orderlist[currentTab].data.length;
    let data = orderlist[currentTab].data;
    let tkStatus = {
      3: '已结算',
      12: '已付款',
      13: '已失效',
      14: '订单成功',
      20: '待助力',
      21: '待收货',
      22: '已收货',
      23: '已收货',
      24: ''
    };
    let orderType = [
      {
        text: '天猫',
        type: 'tm'
      },
      {
        text: '淘宝',
        type: 'tb'
      },
      {
        text: '拼多多',
        type: 'pdd'
      },
      {
        text: '京东',
        type: 'jd'
      }
    ];
    if (length > 0) {
      ulHtml = (
        <View className='ul'>
          {data.map(item => {
            let res = orderType.filter(ele => {
              return ele.text === item.orderType;
            });
            let { payPrice, totalCommission, currentCommission, currentBoostNum, needBoostNum } = item;
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

            let apOrderTypeOption = ['自购', '分享', '直粉', '间粉'];
            return item.orderver == 1 ? (
              <View className={item.tkStatus === 24 ? 'li active' : 'li'} key={item.tradeId}>
                <View className='sec1 clearfix'>
                  <View className='left'>
                    <Image className='img' src={item.img || defaultImg} lazyLoad />
                    {item.tkStatus === 24 && <View className='icon' />}
                  </View>
                  <View className='info'>
                    <View className='row1'>
                      <View className={`tag ${res[0]['type']}`}>{item.orderType}</View>
                      <View className='text'>{item.itemTitle}</View>
                    </View>
                    <View className='price'>
                      到手价<Text className='span'>{payPrice}</Text>
                    </View>
                  </View>
                  {item.tkStatus !== 24 && <View className='status'>{tkStatus[item.tkStatus]}</View>}
                </View>
                <View className='sec2 clearfix'>
                  <View className='price'>
                    <View className='icon' />
                    <View className='text'>
                      此单奖励<Text className='span'>{totalCommission}</Text>元，已领取
                      <Text className='span'>{currentCommission}</Text>元
                    </View>
                  </View>
                  {isBoost && (
                    <View className='btn-invite' onClick={this.handerInvite.bind(this, item)}>
                      去邀请
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View className={item.tkStatus === 13 ? 'li active' : 'li'} key={item.tradeId}>
                <View className='sec1 clearfix'>
                  <View className='left'>
                    <Image className='img' src={item.img || defaultImg} lazyLoad />
                    {item.tkStatus === 13 && <View className='icon' />}
                  </View>
                  <View className='info'>
                    <View className='row1'>
                      <Text className='tag'>{apOrderTypeOption[item.apOrderType - 1]}</Text>
                      <View className='text'>{item.itemTitle}</View>
                    </View>
                    <View className='p'>创建日:{formatDate(item.createTime, 'yyyy年MM月dd日 HH:mm')}</View>
                    <View className='p'>结算日:{formatDate(item.earningTime, 'yyyy年MM月dd日 HH:mm')}</View>
                    <View className='p'>订单号：{item.tradeId}</View>
                  </View>
                  {item.tkStatus !== 13 && <View className='status'>{tkStatus[item.tkStatus]}</View>}
                  <Text className='btn-copy' onClick={this.copyTradeId.bind(this, item.tradeId)}>
                    复制
                  </Text>
                </View>
                <View className='clearfix sec3'>
                  {item.orderDescImg && <Image className='first' src={item.orderDescImg} />}
                  {item.tkStatus !== 13 && <Text className='tag'>预计佣金:￥{item.commission}</Text>}
                  <Text className='text'>
                    <Text>消费金额:¥</Text>
                    <Text className='num'>{item.payPrice}</Text>
                  </Text>
                </View>
              </View>
            );
          })}
          {orderlist[currentTab].loadFinish && <Nomore title='没有更多了哦~' />}
          {loading && <Loading />}
        </View>
      );
    } else {
      ulHtml = orderlist[currentTab].requestSuc && length === 0 && (
        <Nodata title='暂无订单记录' imgurl='https://h5.suixingou.com/miniprogram-assets/sxgqq/mine/nodata.png.png' />
      );
    }
    return (
      <View className='page-container'>
        <View className='main'>
          <View className='ul-tab-h-wrapper'>
            <View className={isFixed ? 'ul-tab-h fixed' : 'ul-tab-h'} style={isFixed ? `top:${this.top}px` : ''}>
              {tabsH.map((item, i) => {
                let className = currentTab === i ? 'li active' : 'li';
                return (
                  <View className={className} key={i} onClick={this.handlerTabsHClick.bind(this, i)}>
                    {item}
                  </View>
                );
              })}
            </View>
          </View>
          {this.state.showPromt && (
            <View className='prompt'>
              <Text className='text'>由于系统升级，历史订单数据无法显示，小伙伴们请下载随心</Text>
              <Text className='icon' onClick={this.handlerHidePrompt} />
            </View>
          )}
          {/* <View
            className='retrieve-order'
            onClick={() => {
              jumpUrl('/pages/mine/orderretrieve/orderretrieve');
            }}
          >
            <View className='text'>已经下单，没有看到订单？找回订单</View>
            <View className='icon' />
          </View> */}
          <View className='ul-wrapper'>{ulHtml}</View>
          {this.state.showJc && (
            <Image
              className='order-jc'
              src='https://h5.suixingou.com/miniprogram-assets/sxgqq/2.1.1/order-jc.png'
              lazyLoad
            />
          )}
        </View>
      </View>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state.mine.order);
  const { loading, loadFailed, failedMsg, data } = state.mine.order;
  const { orderlist } = data;
  return {
    loading,
    loadFailed,
    failedMsg,
    orderlist
  };
}

export default connect(mapStateToProps)(Order);
