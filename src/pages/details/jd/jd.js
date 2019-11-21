import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Swiper, SwiperItem, Image, Button, Canvas, Form } from '@tarojs/components';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, checkSettingStatusAndConfirm, jumpUrl } from '../../../utils/wx';
import Log from '../../../utils/log';
import { generateDetailsPoster } from '../../../utils/canvas';
import { getScene, requestWithParametersToken } from '../../../utils/api';
import { jdActions, promotionUrlActions } from '../../../redux/modules/details';
import { QID, DEFAULT_QID, URL } from '../../../constants';

import './jd.scss';
import withLogin from '../../../components/wrappedComponent/withLogin.js';

import stepBuy from '../../../asset/details/buy.png';
// import stepShare from '../../../asset/details/share.png';
import CoursesModal from '../components/coursesModal/index';
import AtModal from '../../../components/modal/index';

@withLogin('didShow')
class Jd extends Component {
  config = {
    navigationBarTitleText: '商品详情'
  };
  constructor() {
    super(...arguments);
    this.state = {
      showDetails: true,
      canvasImg: '',
      showCopyModal: false,
      showCopyLinkModal: false, //复制链接按钮弹出提示框
      showShareModal: false,
      shareAccid: ''
    };
    this.timer = [];
  }

  async componentDidShow() {
    const { id, scene, accid: shareAccid, pgnum, idx, searchwords } = this.$router.params;
    const { dispatch } = this.props;
    const { accid } = this.props.loginInfo;
    let sAccid = shareAccid; // 分享人accid
    let goodsId = id; // 商品ID
    // 如果是通过扫描二维码方式进来的情况
    if (!goodsId && scene) {
      let dsence = await getScene(scene);
      goodsId = dsence.id;
      sAccid = dsence.accid || '';
    }
    this.goodsId = goodsId; // 保存商品ID，方便后续调用。
    this.shareAccid = sAccid; // 保存shareAccid，方便后面使用
    this.setState({ shareAccid: sAccid });
    // 获取商品详细信息
    await dispatch(jdActions.loadAsync(goodsId, accid));
    if (accid) {
      this.loadPromotionUrl(accid, 'qqOwn'); // 获取转链
    }

    // 落地页日志上报
    Log.active({
      pagetype: 'goods',
      goodsid: goodsId,
      pgnum: pgnum || 1,
      idx: idx || '',
      searchwords: searchwords || '',
      goodssource: 'jingdong'
    });
  }
  async loginSuccessCallback(type) {
    const { accid } = this.props.loginInfo;
    this.loadPromotionUrl(accid, 'qqOwn').then(() => {
      if (type === 'copy') {
        this.copyLink();
      } else if (type === 'share') {
        this.handleShare();
      }
    });
    console.log('登陆成功'); //下一步任务
    this.setState({ showHbModal: false, showOpenedHbModal: true });
  }
  /**
   * 当登录回来时，需要更新佣金等信息。
   * @param {object}} nextProps 下一次接收的props
   */
  /* componentWillReceiveProps(nextProps) {
    // 获取推广url路径
    const {
      loginInfo: { accid: thisAccid },
      goodsInfo: { materialUrl: thisMaterialUrl },
      dispatch
    } = this.props;
    const {
      loginInfo: { accid },
      goodsInfo: { materialUrl }
    } = nextProps;
    if (accid && thisAccid !== accid) {
      this.timer.push(
        // setTimeout解决componentWillReceiveProps进入死循环问题
        setTimeout(() => {
          dispatch(jdActions.loadAsync(this.goodsId, accid)).then(() => {
            if (thisMaterialUrl && thisMaterialUrl !== materialUrl && !this.shareAccid) {
              this.loadPromotionUrl(accid, 'Own'); // 获取自购转链
            }
          });
        }, 1)
      );
    }
  } */

  /**
   * 获取转链
   * @param {string} accid 用户或分享人accid
   * @param {string} opt Own or share
   */
  async loadPromotionUrl(accid, opt) {
    let customParameters = '';
    if (process.env.NODE_ENV === 'development') {
      customParameters = `${accid}_${opt}_test_${getGlobalData(QID) || DEFAULT_QID}`;
    } else {
      customParameters = `${accid}_${opt}_${getGlobalData(QID) || DEFAULT_QID}`;
    }
    const { goodsInfo, dispatch } = this.props;
    const { materialUrl, couponUrl } = goodsInfo;
    return dispatch(promotionUrlActions.loadJdAsync(this.goodsId, customParameters, materialUrl, couponUrl));
  }

  componentWillUnmount() {
    this.props.dispatch(jdActions.clear());
    this.props.dispatch(promotionUrlActions.clear());
    this.timer.forEach(t => {
      clearTimeout(t);
    });
  }

  // 分享商品
  async handleShare() {
    /* const { userInfo } = this.props;
    const { invitecode } = userInfo.data; */
    const { accid } = this.props.loginInfo;
    Log.click({ buttonfid: 'xq_10134', goodsid: this.goodsId, goodssource: 'jingdong' });
    // 生成推广链接
    /* if (!this.shareAccid) {
      // 自购进入（非分享进入）
      await this.loadPromotionUrl(this.props.loginInfo.accid, 'qqshare'); // 获取转链
    } */
    // 分享进入（不登录也可以分享）
    if (accid) {
      this.showSharePoster();
    }
  }

  showSharePoster() {
    this.setState({
      showShareModal: true
    });
    Taro.showToast({
      title: '正在生成图片...',
      icon: 'loading',
      duration: 2000
    });
    // this.generateCanvas();
    const { figureurl, nickname } = this.props.loginInfo;
    const { goodsGalleryUrls, goodsInfo } = this.props;
    const poster = goodsGalleryUrls[0];
    const canvasId = 'canvas_show';
    const {
      name, // 商品名称标题
      newPrice, // 券后价
      oldPrice, // 原价
      coupon, // 优惠券金额
      commission, // 佣金
      soldQuantity //销售量
    } = goodsInfo;
    const { ownShortUrl } = this.props.promotionUrl.data || {};
    let shareShortUrl = ownShortUrl;
    generateDetailsPoster({
      ctx: Taro.createCanvasContext(canvasId, this.$scope), // canvas上下文对象
      name, // 商品名称标题
      newPrice, // 券后价
      oldPrice, // 原价
      coupon, // 优惠券金额
      commission, // 佣金
      soldQuantity,
      poster, // 海报
      pagePath: 'pages/details/jd/jd',
      avatarUrl: figureurl, // 默认头像
      nickName: nickname, // 昵称
      scene: encodeURIComponent(`id=${this.goodsId}&accid=${this.shareAccid || this.props.loginInfo.accid}`),
      scope: this.$scope,
      shareShortUrl
    })
      .then(() => {
        return Taro.canvasToTempFilePath(
          {
            canvasId,
            fileType: 'jpg',
            quality: 0.8,
            destWidth: 750,
            destHeight: 1123.5
          },
          this.$scope
        );
      })
      .then(({ tempFilePath }) => {
        this.setState({
          canvasImg: tempFilePath
        });
        Taro.hideToast();
      });
  }

  savePic() {
    Log.click({ buttonfid: 'xq_10138', goodsid: this.goodsId, goodssource: 'jingdong' });
    if (!this.state.canvasImg) {
      return;
    }
    checkSettingStatusAndConfirm(
      'writePhotosAlbum',
      {
        title: '是否要打开设置页',
        content: '获取相册授权，请到小程序设置中打开授权'
      },
      status => {
        if (status || status === null) {
          Taro.saveImageToPhotosAlbum({
            filePath: this.state.canvasImg
          })
            .then(() => {
              Taro.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
              });
            })
            .catch(() => {
              Taro.showToast({
                title: '保存失败',
                icon: 'none',
                duration: 2000
              });
            });
        } else {
          Taro.showToast({
            title: '授权失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
    );
  }

  preview(e) {
    e.stopPropagation();
    Log.click({ buttonfid: 'xq_10139', goodsid: this.goodsId, goodssource: 'jingdong' });
    Taro.previewImage({
      current: this.state.canvasImg, // 当前显示图片的http链接
      urls: [this.state.canvasImg] // 需要预览的图片http链接列表
    });
  }

  previewSwiper(url, e) {
    e.stopPropagation();
    const { goodsGalleryUrls } = this.props;
    Taro.previewImage({
      current: url, // 当前显示图片的http链接
      urls: goodsGalleryUrls // 需要预览的图片http链接列表
    });
  }

  onShareAppMessage() {
    const { goodsGalleryUrls, goodsInfo } = this.props;
    const myInvitecode = getGlobalData('myInvitecode');
    const othersInvitecode = getGlobalData('othersInvitecode');
    return {
      title: goodsInfo.name,
      path: `/pages/details/jd/jd?id=${this.goodsId}&accid=${this.shareAccid ||
        this.props.loginInfo.accid ||
        ''}&invitecode=${myInvitecode || othersInvitecode}`,
      imageUrl: goodsGalleryUrls[0]
    };
  }

  /**
   * 复制文案
   */
  async handleCopyTxt() {
    Log.click({ buttonfid: 'xq_10140', goodsid: this.goodsId, goodssource: 'jingdong' });
    if (!this.shareAccid) {
      // 自购进入（非分享进入）
      await this.loadPromotionUrl(this.props.loginInfo.accid, 'qqshare'); // 获取转链
    }
    this.setState({ showCopyModal: true, showShareModal: false });
  }

  copyLink() {
    console.log(this.props.promotionUrl.data);
    const { ownShortUrl, shareShortUrl } = this.props.promotionUrl.data || {};
    const shortUrl = ownShortUrl;
    if (shortUrl) {
      Taro.setClipboardData({
        data: shortUrl
      }).then(() => {
        Taro.getClipboardData().then(res => {
          console.log('复制成功：', res);
          Taro.hideToast();
          this.setState({ showCopyLinkModal: true });
        });
      });
    }
    Log.click({ buttonfid: 'xq_10133' });
  }

  copy() {
    const {
      name, // 商品名称标题
      coupon, // 优惠券
      newPrice, // 券后价
      oldPrice // 原价
    } = this.props.goodsInfo || {};
    const { shareShortUrl } = this.props.promotionUrl.data || {};
    const data = `【限时抢购】${name}
    ${coupon ? '【原价】' + oldPrice : ''}
    ${coupon ? '【券后价】' : '【价格】'}${newPrice}
    【下单地址】${shareShortUrl}`;
    Taro.setClipboardData({
      data
    }).then(() => {
      Taro.getClipboardData().then(res => {
        console.log('复制成功：', res);
        Taro.showToast({
          title: '文案链接已复制，请粘贴发送好友',
          icon: 'none',
          duration: 2000
        });
      });
    });
    Log.click({ buttonfid: 'xq_10141', goodsid: this.goodsId, goodssource: 'jingdong' });
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
    const {
      showDetails,
      showShareModal,
      canvasImg,
      showCopyModal,
      shareAccid,
      showCopyLinkModal,
      showHbModal,
      showOpenedHbModal
    } = this.state;
    const { goodsGalleryUrls, goodsInfo } = this.props;
    const { shareShortUrl } = this.props.promotionUrl.data;
    const { accid } = this.props.loginInfo;
    // console.log('====================')
    // // console.log(this.$router.params)
    // console.log(!shareAccid)
    // console.log('====================')
    const {
      name, // 商品名称标题
      soldQuantity, // 已售数量
      newPrice, // 券后价
      oldPrice, // 原价
      coupon, // 优惠券金额
      commission // 佣金
    } = goodsInfo || {};
    // 轮播banner
    const bannerSwiper = goodsGalleryUrls.map(u => {
      return (
        <SwiperItem className='swiper-item' key={u} onClick={this.previewSwiper.bind(this, u)}>
          <Image className='pic' src={u} />
        </SwiperItem>
      );
    });

    return (
      <View className='page-container'>
        <View
          className='detail'
          // style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}
        >
          {/* titlebar */}
          {/* <TitleBar title='商品详情' /> */}
          {/* 商品介绍 */}
          <View className='goods-intro'>
            <Swiper
              className='swiper'
              indicatorColor='rgba(255, 255, 255, 0.5)' // 指示点颜色
              indicatorActiveColor='#ffffff' // 当前选中的指示点颜色
              // onChange={this.handleBannerChange.bind(this)}
              circular // 是否采用衔接滑动
              indicatorDots // 是否显示面板指示点
              // autoplay // 是否自动切换
            >
              {bannerSwiper}
            </Swiper>
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
                    {/* <View className='tag'>规则</View> */}
                  </View>
                </View>
                <View className='row2'>
                  <View className='left'>原价¥{oldPrice}</View>
                  <View className='right'>已售{soldQuantity}</View>
                </View>
              </View>
              <Text className='title'>
                <Text className='union jd' />
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
                {goodsGalleryUrls &&
                  goodsGalleryUrls.map(u => (
                    <Image
                      key={u}
                      className='img'
                      mode='widthFix'
                      lazyLoad
                      src={u}
                      onClick={this.previewSwiper.bind(this, u)}
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
            <View className='share' onClick={this.handleShare}>
              立即分享
              {!(shareAccid || accid) && (
                <Button
                  className='btn'
                  openType='getUserInfo'
                  onGetUserInfo={this.onAuthConfirmClick.bind(this, 'share')}
                />
              )}
            </View>
            <Form onSubmit={this.formSubmit} reportSubmit='true' onReset={this.formReset} className='copy-link'>
              <View className='copy-link'>
                <Button className='form-button' formType='submit' onClick={this.copyLink.bind(this)}>
                  复制链接
                </Button>
                {!(shareAccid || accid) && (
                  <Button
                    className='btn'
                    openType='getUserInfo'
                    onGetUserInfo={this.onAuthConfirmClick.bind(this, 'copy')}
                  />
                )}
              </View>
            </Form>
          </View>
          {showShareModal && (
            <View
              className='share-modal'
              onTouchMove={e => {
                e.stopPropagation();
              }}
            >
              <View
                className='canvas-wrap'
                onClick={() => {
                  this.setState({ showShareModal: false });
                }}
              >
                <Canvas
                  canvasId='canvas_show'
                  className='canvas-show'
                  bindError={() => {
                    console.error('canvas_show error!!!');
                  }}
                />
                {canvasImg && <Image className='canvas-img' src={canvasImg} onClick={this.preview.bind(this)} />}
              </View>
              <View className='btns-wrap'>
                <View className='item share'>
                  <View className='icon wechat' />
                  <View className='txt'>分享好友</View>
                  <Button
                    openType='share'
                    className='btn'
                    onClick={() => {
                      Log.click({ buttonfid: 'x_10134', goodsid: this.goodsId, goodssource: 'jingdong' });
                    }}
                  />
                </View>
                <View className='item save' onClick={this.savePic}>
                  <View className='icon download' />
                  <View className='txt'>保存图片</View>
                </View>
                <View className='item copy' onClick={this.handleCopyTxt}>
                  <View className='icon link' />
                  <View className='txt'>复制文案</View>
                </View>
              </View>
              {/* <Canvas
              canvasId='canvas_share'
              style={`width:${Taro.pxTransform(960)}; height:${Taro.pxTransform(1732)}; display:none;`}
            /> */}
            </View>
          )}
          {showCopyModal && (
            <View
              className='copy-modal-wrap'
              onTouchMove={e => {
                e.stopPropagation();
              }}
            >
              <View className='copy-modal'>
                <View className='title'>复制文案分享</View>
                <View className='content'>
                  <Text className='item goods-title'>【限时抢购】{name}</Text>
                  {coupon && <Text className='item goods-oldprice'>【原价】{oldPrice}</Text>}
                  <Text className='item goods-newprice'>
                    【{coupon ? '券后价' : '价格'}】<Text className='price'>{newPrice}</Text>
                  </Text>
                  <Text className='item goods-url'>
                    【下单地址】<Text className='link'>{shareShortUrl}</Text>
                  </Text>
                  {/* <Text className='item goods-line'>-----------------</Text> */}
                  {/* <Text className='item goods-reason'>【必买理由】</Text> */}
                  {/* <Text className='item goods-desc'>{desc}</Text> */}
                </View>
                <Form onSubmit={this.formSubmit} reportSubmit='true' onReset={this.formReset} className='copy-link'>
                  <View className='btn-copy' onClick={this.copy.bind(this)}>
                    <Button className='form-button' formType='submit'>
                      一键复制
                    </Button>
                  </View>
                </Form>
                <View
                  className='close'
                  onClick={() => {
                    this.setState({ showCopyModal: false });
                  }}
                />
              </View>
            </View>
          )}
          <Canvas
            canvasId='canvas_show2'
            className='canvas-show2'
            bindError={() => {
              console.error('canvas_show error!!!');
            }}
          />
          <CoursesModal />
          <AtModal isOpened={showCopyLinkModal} confirmText=' '>
            <Image
              className='img-xq'
              src='https://h5.suixingou.com/miniprogram-assets/sxgqq/qq/xq-modal.png'
              mode='widthFix'
              onClick={() => {
                let time = new Date().getTime();
                let showRedpackModal = Taro.getStorageSync('showCopyLinkModal');
                if (!showRedpackModal || time - showRedpackModal >= 0) {
                  Taro.setStorageSync('showCopyLinkModal', time + 7 * 24 * 60 * 60 * 1000);
                  jumpUrl('/pages/home/courses/novice1');
                  this.setState({
                    showCopyLinkModal: true
                  });
                } else {
                  this.setState({
                    showCopyLinkModal: false
                  });
                }
                this.setState({ showCopyLinkModal: false });
              }}
            />
          </AtModal>
          {/* 红包弹窗2 */}
          {/* <AtModal isOpened={showOpenedHbModal} confirmText=' '>
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
          </AtModal> */}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { promotionUrl } = state.details;
  //const { userInfo } = state.mine;
  const { loginInfo } = state.login;
  const { goodsGalleryUrls, goodsInfo } = state.details.jd.data;
  return {
    //userInfo,
    loginInfo,
    goodsGalleryUrls,
    goodsInfo,
    promotionUrl
  };
}

export default connect(mapStateToProps)(Jd);
