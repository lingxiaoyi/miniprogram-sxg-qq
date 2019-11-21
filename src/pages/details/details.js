import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Swiper, SwiperItem, Image, Button, Form } from '@tarojs/components';
import { getGlobalData, jumpUrl } from '../../utils/wx';
import { priceConversion } from '../../utils/util';
import { detailsTbActions } from '../../redux/modules/details';
import { getScene, requestWithParameters, requestWithParametersToken } from '../../utils/api';
import { URL } from '../../constants/index';
import Log from '../../utils/log';
import TitleBar from '../../components/titleBar/titleBar';
import withLogin from '../../components/wrappedComponent/withLogin.js';
import stepBuy from '../../asset/details/tb-buy.png';
// import stepShare from '../../asset/details/share.png';
import './pdd/pdd.scss';
import AtModal from '../../components/modal/index';
import CoursesModal from './components/coursesModal';

@withLogin('didShow')
class Tb extends Component {
  config = {
    navigationBarTitleText: '商品详情'
  };
  constructor() {
    super(...arguments);
    this.state = {
      showDetails: true,
      shareAccid: '',
      showCopyLinkModal: false //复制链接按钮弹出提示框
    };
    this.shareAccid = '';
  }
  async componentDidShow() {
    const { id, scene, accid: shareAccid, pgnum, idx, searchwords } = this.$router.params;
    const { dispatch } = this.props;
    let sAccid = shareAccid; // 分享人accid
    let goodsId = id; // 商品ID
    // 如果是通过扫描二维码方式进来的情况
    if (!goodsId && scene) {
      let dsence = await getScene(scene);
      // console.log(dsence);
      goodsId = dsence.id;
      sAccid = dsence.accid || '';
    }
    this.goodsId = goodsId; // 保存商品ID，方便后续调用。
    this.shareAccid = sAccid; // 保存shareAccid，方便后面使用
    this.setState({ shareAccid: sAccid });
    // 获取商品详细信息
    await dispatch(detailsTbActions.loadDetailsGoodsAsync(goodsId, ''));

    // 日志上报
    Log.active({
      pagetype: 'goods',
      goodsid: goodsId,
      pgnum: pgnum || 1,
      idx: idx || '',
      searchwords: searchwords || '',
      goodssource: 'tb'
    });
    Log.click({ buttonfid: 'xq_10155' });
  }
  componentDidMount() {}

  loginSuccessCallback(type) {
    this.componentDidShow(); //登陆注册之后重新执行一次这个逻辑
    if (type === 'copy') {
      this.copy();
    }
    console.log('登陆成功'); //下一步任务
  }
  componentWillUnmount() {
    this.props.dispatch(detailsTbActions.clearDetailsGoods());
  }

  onShareAppMessage() {
    const { goodsImg, goodsTitle } = this.props.data;
    const myInvitecode = getGlobalData('myInvitecode');
    const othersInvitecode = getGlobalData('othersInvitecode');
    return {
      title: goodsTitle,
      path: `/pages/details/details?id=${this.goodsId}&accid=${getGlobalData('sxg_accid') ||
        ''}&invitecode=${myInvitecode || othersInvitecode}`,
      imageUrl: goodsImg
    };
  }

  async copy() {
    Log.click({ buttonfid: 'xq_10156', goodsid: this.goodsId, goodssource: 'taobao' });
    let { originalPrice, rebatePrice, goodsTitle, goodsId, goodsImg, couponPrice } = this.props.data;
    const { accid } = this.props.loginInfo;
    let res = await requestWithParameters(URL.gettkl, {
      goodsId,
      goodsTitle,
      goodsImg,
      relationId: 'null',
      member_level: '',
      originalPrice,
      rebatePrice,
      hascoupon: !!couponPrice,
      posId: this.shareAccid ? '1030' : '1029',
      isShare: this.shareAccid ? '1' : '0',
      accid: this.shareAccid || accid
    });
    //详情页到详情页_内购：1029；
    //详情页到详情页_分享：1030；
    if (res.data.tkl) {
      Taro.setClipboardData({
        data: `${res.data.tkl}`
      }).then(() => {
        Taro.getClipboardData().then(() => {
          Taro.showToast({
            title: '复制成功,打开【手机淘宝】即可购买',
            icon: 'none',
            duration: 2000
          });
        });
      });
    } else {
      Taro.showToast({
        title: '复制失败',
        icon: 'none',
        duration: 2000
      });
    }
  }
  formSubmit = e => {
    this.formId = e.detail.formId;
    requestWithParametersToken(URL.submitFormid, {
      formid: this.formId
    });
  };
  formReset = e => {
    console.log(e);
  };
  render() {
    let {
      goodsImgList,
      originalPrice,
      rebatePrice,
      goodsTitle,
      couponPrice,
      earnSum,
      purchaseNum,
      shopType
    } = this.props.data;
    let { showCopyLinkModal, shareAccid, showDetails } = this.state;
    const { accid } = this.props.loginInfo;
    const {
      name, // 商品名称标题
      soldQuantity, // 已售数量
      //coupon, // 优惠券
      newPrice, // 券后价
      oldPrice, // 原价
      commission // 佣金
    } = {
      name: goodsTitle,
      coupon: couponPrice,
      newPrice: rebatePrice,
      oldPrice: originalPrice,
      commission: earnSum,
      soldQuantity: priceConversion(purchaseNum)
    };
    // 轮播banner
    const bannerSwiper = goodsImgList.map(u => {
      return (
        <SwiperItem className='swiper-item' key={u} /* onClick={this.previewSwiper.bind(this, u)} */>
          <Image className='pic' src={u} />
        </SwiperItem>
      );
    });

    return (
      <View className='page-container'>
        <View className='detail'>
          {/* titlebar */}
          {/* <TitleBar title='商品详情' /> */}
          {/* 商品介绍 */}
          <View className='goods-intro'>
            <Swiper
              className='swiper'
              indicatorColor='rgba(255, 255, 255, 0.5)' // 指示点颜色
              indicatorActiveColor='#ffffff' // 当前选中的指示点颜色
              circular // 是否采用衔接滑动
              indicatorDots // 是否显示面板指示点
            >
              {bannerSwiper}
            </Swiper>
            {/* <View className='intro'>
              <Text className='title'>
                <Text className={shopType === 0 ? 'union tao' : 'union tm'} />
                {name}
              </Text>
              <View className='info'>
                <View className='price'>
                  <View className='new'>
                    券后￥<Text className='num'>{newPrice}</Text>
                  </View>
                  {coupon && <View className='old'>原价￥{oldPrice}</View>}
                  {coupon && <View className='coupon'>{coupon}元券</View>}
                </View>
                <Text className='sold'>已售{soldQuantity}件</Text>
              </View>
            </View> */}
            <View className='intro'>
              <View className='info'>
                <View className='row1'>
                  <View className='price'>
                    <View className='span'>￥</View>
                    <View className='num'>{newPrice}</View>
                    <View className='tag'>券后价</View>
                  </View>
                  <View className='right'>
                    <View className='text'>下单可领{commission}元红包</View>
                  </View>
                </View>
                <View className='row2'>
                  <View className='left'>原价¥{oldPrice}</View>
                  <View className='right'>已售{soldQuantity}</View>
                </View>
              </View>
              <Text className='title'>
                <Text className={shopType === 0 ? 'union tao' : 'union tm'}  />
                {name}
              </Text>
            </View>
            <View className='steps'>
              <Image className='buy' mode='aspectFill' src={stepBuy} />
              {/* <Image className='share' mode='aspectFill' src={stepShare} /> */}
            </View>
          </View>
          {/* 商品详情描述 */}
          <View className='goods-details-wrap'>
            <View
              className={showDetails ? 'expand-details show' : 'expand-details'}
              onClick={() => {
                this.setState({ showDetails: !this.state.showDetails });
              }}
            >
              {showDetails ? '收起' : '查看'}宝贝详情
            </View>
            {showDetails && (
              <View className='goods-details'>
                {goodsImgList &&
                  goodsImgList.map(u => (
                    <Image
                      key={u}
                      className='img'
                      mode='widthFix'
                      lazyLoad
                      src={u}
                      /*  onClick={this.previewSwiper.bind(this, u)} */
                    />
                  ))}
              </View>
            )}
          </View>
          {/* 猜你喜欢(推荐) */}
          {/* <View className='recommend'>
          <View className='title'>猜你喜欢</View>
          <View className='list'>
            <GoodsList goodsList={goodsList} itemStyle='item' />
          </View>
        </View> */}
          {/* 底部操作区 */}
          <View
            className='footer'
            style={getGlobalData('system_info').isIpx ? { marginBottom: Taro.pxTransform(64) } : ''}
          >
            <View
              className='home'
              onClick={() => {
                Log.click({ buttonfid: 'xq_10131' });
                Taro.switchTab({ url: '/pages/home/home' });
              }}
            >
              <Text className='icon' />
              <Text className='txt'>返回首页</Text>
            </View>
            <Form onSubmit={this.formSubmit} reportSubmit='true' onReset={this.formReset} className='copy-link'>
              <View className='copy-link'>
                <Button className='form-button' formType='submit' onClick={this.copy.bind(this)}>
                  复制淘口令
                </Button>
                {!(shareAccid || accid) && (
                  <Button
                    openType='getUserInfo'
                    className='btn'
                    onGetUserInfo={this.onAuthConfirmClick.bind(this, 'copy')}
                  />
                )}
              </View>
            </Form>
            <View
              className='share'
              onClick={() => {
                Log.click({ buttonfid: 'xq_10157', goodsid: this.goodsId, goodssource: 'taobao' });
              }}
            >
              分享商品
              {!(shareAccid || accid) && (
                <Button
                  openType='getUserInfo'
                  className='btn'
                  onGetUserInfo={this.onAuthConfirmClick.bind(this, 'share')}
                />
              )}
              {(shareAccid || accid) && <Button openType='share' className='btn' />}
            </View>
          </View>
          <CoursesModal type='tb' />
          <AtModal isOpened={showCopyLinkModal} confirmText=' '>
            <Image
              className='img'
              src='https://h5.suixingou.com/miniprogram-assets/sxgqq/qq/xq-modal.png'
              onClick={() => {
                this.setState({ showCopyLinkModal: false });
                jumpUrl('/pages/home/courses/novice1');
              }}
            />
            <View
              className='btn-close'
              onClick={() => {
                this.setState({ showCopyLinkModal: false });
              }}
            />
          </AtModal>
        </View>
      </View>
    );
  }
}
function mapStateToProps(state) {
  const { detailsTb } = state.details;
  const { userInfo } = state.mine;
  const { loginInfo } = state.login;
  return {
    data: detailsTb.data,
    userInfo,
    loginInfo
  };
}

export default connect(mapStateToProps)(Tb);
