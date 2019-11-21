import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image, Text } from '@tarojs/components';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import { minus } from '../../../utils/util';
import withLogin from '../../../components/wrappedComponent/withLogin';
import { requestWithFormMD5 } from '../../../utils/api';
import { URL } from '../../../constants/index';
import './activity.scss';
import Log from '../../../utils/log';

@withLogin('didMount')
class HotGoods extends Component {
  config = {
    navigationBarTitleText: ''
  };

  constructor() {
    super(...arguments);
    this.state = {
      title: '9.9包邮',
      goodsList: []
    };
    this.sub_id = ''; //11
  }

  componentDidMount() {
    Log.click({ buttonfid: 'xq_10152' });
    let { sub_id } = this.$router.params;
    if (sub_id) {
      this.sub_id = sub_id;
    } else {
      this.sub_id = '11';
    }

    if (sub_id === '12') {
      this.setState({
        title: '1元专场'
      });
    }
    /* requestWithParameters(URL.special, {
      type: '2',
      specialId: '115'
    }).then(res => {
      let spGoodsList = res.data.special.spGoodsList;
      let cateId = [];
      let cateName = [];
      spGoodsList.map(item => {
        cateId.push(item.cateId);
        cateName.push(item.cateName);
      });
      this.spGoodsList = spGoodsList;
      this.setState({
        goodsList: spGoodsList,
        cateName: [...new Set(cateName)],
        activeCateName: cateName[0]
      }, ()=>{
        this.handleFilterGoods(cateName[0])
      });
    }); */
    let accid = getGlobalData('sxg_accid') || '';
    requestWithFormMD5(URL.applets_theme_operation_list, {
      pid: '54291221',
      sub_id: this.sub_id, //11
      cate_id: '',
      accid
    }).then(res => {
      let spGoodsList = res.data;
      let cateId = [];
      let cateName = [];
      spGoodsList.map(item => {
        cateId.push(item.cateId);
        cateName.push(item.cateName);
      });
      this.spGoodsList = spGoodsList;
      this.setState(
        {
          goodsList: spGoodsList
        },
        () => {
          this.handleFilterGoods(cateName[0]);
        }
      );
    });
  }

  componentWillUnmount() {
    // 页面卸载时，清空数据
  }

  /* onReachBottom() {
    const {
      dispatch,
      loginInfo: { accid },
      noMore
    } = this.props;
    if (!noMore && this.type !== 'mix') {
      dispatch(hotGoodsActions.loadByScrollAsync(this.id, accid, this.type));
    }
  } */

  handleGoodsClick(goodsId) {
    Log.click({ buttonfid: 'xq_10154' });
    jumpUrl(`/pages/details/pdd/pdd?id=${goodsId}`);
  }
  handleFilterGoods(cateName) {
    Log.click({ buttonfid: 'xq_10153' });
    let goodsList = this.spGoodsList.filter(item => {
      return item.cateName === cateName;
    });
    this.setState({
      goodsList: cateName === '精选特惠' ? this.spGoodsList : goodsList
    });
  }
  render() {
    const { title, goodsList, loading } = this.state;
    return (
      <View className='page-container'/*  style={{ marginTop: Taro.pxTransform(getGlobalData('titlebar_height')) }} */>
        <View
          className='hot-goods'
          // style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}
        >
          {/* <TitleBar title={title} /> */}
          <View className='banner'>
            {this.sub_id === '11' && (
              <Image
                className='img'
                src='https://h5.suixingou.com/miniprogram-assets/sxgqq/activity/banner.png'
                mode='widthFix'
              />
            )}
            {this.sub_id === '12' && (
              <Image
                className='img'
                src='https://h5.suixingou.com/miniprogram-assets/sxgqq/activity/1-banner.png'
                mode='widthFix'
              />
            )}
          </View>
          {/* <View className='menu'>
          <View className='ul'>
            {cateName.map(item => {
              return (
                <View
                  className={activeCateName === item ? 'li active' : 'li'}
                  key={item}
                  onClick={this.handleFilterGoods.bind(this, item)}
                >
                  <View className='span'>{item}</View>
                </View>
              );
            })}
          </View>
        </View> */}
          {/* 商品列表 */}
          <View className='goods-list'>
            {loading && goodsList.length === 0 && <View className='loading'>加载中...</View>}
            {!loading && goodsList.length > 0 && (
              <View>
                {goodsList.map(item => {
                  /* let {
                  originalPrice,
                  rebatePrice,
                  goodsTitle,
                  couponPrice,
                  earnSum,
                  purchaseNum,
                  goodsId,
                  goodsImg
                } = item; */

                  /* const {
                  name, // 商品名称标题
                  soldQuantity, // 已售数量
                  coupon, // 优惠券
                  newPrice, // 券后价
                  oldPrice, // 原价
                  commission // 佣金
                } = {
                  name: goods_name,
                  coupon: couponPrice,
                  newPrice: rebatePrice,
                  oldPrice: originalPrice,
                  commission: earnSum,
                  soldQuantity: priceConversion(purchaseNum)
                }; */
                  let {
                    goods_name,
                    sales_tip, //销售数量
                    goods_id,
                    min_group_price,
                    coupon_discount,
                    promotion_rate,
                    goods_thumbnail_url
                  } = item;
                  const {
                    name, // 商品名称标题
                    soldQuantity, // 已售数量
                    coupon, // 优惠券
                    newPrice, // 券后价
                    oldPrice, // 原价
                    commission, // 佣金
                    goodsId,
                    goodsImg
                  } = {
                    goodsImg: goods_thumbnail_url,
                    goodsId: goods_id,
                    name: goods_name,
                    coupon: coupon_discount / 100, // 优惠券金额
                    newPrice: minus(min_group_price, coupon_discount) / 100, // 券后价
                    oldPrice: min_group_price / 100, // 原价
                    soldQuantity: sales_tip, // 已售数量
                    commission:
                      Math.floor((promotion_rate / 1000) * (minus(min_group_price, coupon_discount) / 100) * 100) / 100 // 佣金
                  };
                  return (
                    <View className='item' key={goodsId} onClick={this.handleGoodsClick.bind(this, goodsId)}>
                      <View className='goods-item'>
                        <View className='img-wrap'>
                          <Image className='img' src={goodsImg} lazyLoad />
                        </View>
                        <View className='txt-wrap'>
                          <Text className='title'>{name}</Text>
                          <View className='info'>
                            {coupon ? <Text className='coupon'>券￥{coupon}</Text> : <Text />}
                            <Text className='commission'>预估佣金￥{commission}</Text>
                          </View>
                          <View className='money'>
                            <View className='price'>{coupon && <Text className='old'>￥{oldPrice}</Text>}</View>
                          </View>
                          <View className='money'>
                            <View className='price'>
                              <Text className='new'>
                                <Text>￥</Text>
                                <Text className='span'>{newPrice}</Text>
                              </Text>
                            </View>
                            <Text className='sold'>爆卖{soldQuantity}件</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { hotGoods } = state.home;
  const { loading, loadingByScroll, noMore, data: goodsList } = hotGoods;
  const { loginInfo } = state.login;
  return {
    goodsList,
    loading,
    loadingByScroll,
    noMore,
    loginInfo
  };
}

export default connect(mapStateToProps)(HotGoods);
