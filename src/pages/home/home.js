import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image, Button, ScrollView, Swiper, SwiperItem, Block } from '@tarojs/components';
import GoodsList from '../../components/goods/goodsList';
import Loading from '../../components/loading/loading';
import NoMore from '../../components/noMore/noMore';
import TitleBar from '../../components/titleBar/titleBar';
import { getGlobalData, setGlobalData, jumpUrl } from '../../utils/wx';
import Log from '../../utils/log';
import {
  goodsActions,
  searchActions,
  bannersActions,
  queryConfigActions,
  listcategoryActions,
  tabsActions
} from '../../redux/modules/home';
//import { tabs } from '../../constants';
import withLogin from '../../components/wrappedComponent/withLogin.js';
import AtModal from '../../components/modal/index';
import './home.scss';
import iconsearch from '../../asset/search.png';
import icon20 from '../../asset/home/icon/icon-2.png';
import icon5 from '../../asset/home/icon/icon-5.png';
import icon3 from '../../asset/home/icon/icon-3.png';
import qq20year from '../../asset/home/icon/icon-1.png';

@withLogin('didMount')
class Home extends Component {
  config = {
    navigationBarTitleText: '首页',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom'
    //enablePullDownRefresh: true
  };

  constructor(props) {
    super(props);
    // 用于频道滚动定位
    this.pdTop = 0;
    this.referrenceTop = 0;
    this.stBarHeight = getGlobalData('statusbar_height') / 2;
    this.isIpx = getGlobalData('system_info').isIpx;
    this.timer = [];
    this.state = {
      showTitleBarSearch: false,
      showSearchModal: false,
      showSearchGoodsModal: false,
      clipboardData: '',
      show99Modal: false,
      showTb: false,
      showHbModal: false,
      showOpenedHbModal: false,
      currentTab: 1,
      tabsScrollLeft: 0,
      isReachBottom: false,
      fixedTabsList: false
    };
    this.loadOnce = false;
  }

  async componentDidMount() {
    const { dispatch, loginInfo } = this.props;
    const { accid, openid } = loginInfo;
    const cloudOptions = await getGlobalData('cloudControlPromise');
    this.state.showTb = parseInt(cloudOptions.status) === 1;
    console.log('显示淘宝？', this.state.showTb);
    dispatch(queryConfigActions.loadQueryConfigAsync());
    if (this.state.showTb) {
      dispatch(listcategoryActions.loadlistcategoryAsync()).then(() => {
        const { listcategory } = this.props;
        let key = Object.keys(listcategory.data)[0];
        this.id = key;
        this.setState({ currentTab: key });
        //dispatch(goodsActions.loadTbGoodsAsync(key));
        this.props.dispatch(goodsActions.getRank()).then(() => {
          this.setStepsTop();
          this.setTabsTop();
        }); //全部调取爆款接口
      });
    } else {
      dispatch(bannersActions.loadBannerAsync(accid, openid));
      dispatch(queryConfigActions.loadSubjectInfo()).then(() => {
        const { queryConfig } = this.props;
        console.log('queryConfig', queryConfig);
        const { SubjectInfo } = queryConfig;
        this.props.dispatch(goodsActions.changeOpt(SubjectInfo[2].id));
        this.setState({ currentTab: SubjectInfo[2].id });
        dispatch(goodsActions.loadPddGoodsAsync(accid));
      }); //加载栏目
      /* dispatch(tabsActions.loadTabsAsync()).then(() => {
        const { tabs } = this.props;
        this.props.dispatch(goodsActions.changeOpt(tabs.data[0].opt_id));
        this.setState({ currentTab: tabs.data[0].opt_id });
        dispatch(goodsActions.loadPddGoodsAsync(accid));
      }); */ this.setStepsTop();
      this.setTabsTop();
    }
  }

  loginSuccessCallback() {
    //二次登陆执行的逻辑
    this.setState({ showHbModal: false, showOpenedHbModal: true });
    Log.click({ buttonfid: 'xq_10165' });
  }

  componentWillUnmount() {
    this.timer.forEach(t => {
      clearTimeout(t);
      clearInterval(t);
    });
    this.props.dispatch(goodsActions.loadClear());
  }

  componentDidShow() {
    this.getClipboardData();
    const { loginInfo } = this.props;
    const { accid } = loginInfo;
    if (accid && this.state.showHbModal) {
      this.setState({ showHbModal: false, showOpenedHbModal: false });
    }
  }

  componentDidHide() {
    this.setState({
      showSearchGoodsModal: false,
      showSearchModal: false
    });
  }
  setStepsTop() {
    const query = Taro.createSelectorQuery();
    query.select('.search-wrap').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(res => {
      this.referrenceTop = res[0].top;
    });
  }

  setTabsTop() {
    const query = Taro.createSelectorQuery();
    query.select('.tabs-list').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(res => {
      this.tabsTop = res[0].top;
      this.tabsHeight = res[0].height;
    });
  }

  onShareAppMessage({ from }) {
    const myInvitecode = getGlobalData('myInvitecode');
    const othersInvitecode = getGlobalData('othersInvitecode');
    let ic = myInvitecode || othersInvitecode;
    const { nickname } = this.props.userInfo.data;
    const name = nickname || '您的好友';
    if (from === 'menu') {
      return {
        title: `${name}邀请您共享拼多多和京东购物省钱返利`,
        path: ic ? `pages/login/login?invitecode=${ic}` : 'pages/home/home',
        imageUrl: 'https://h5.suixingou.com/miniprogram-assets/sxgqq//share/poster_invite.jpg'
      };
    } else {
      return {
        title: `${name}邀请您共享拼多多和京东购物省钱返利`,
        path: `pages/login/login?invitecode=${ic || ''}`,
        imageUrl: 'https://h5.suixingou.com/miniprogram-assets/sxgqq//share/poster_invite.jpg'
      };
    }
  }

  onPullDownRefresh() {
    const {
      dispatch,
      loginInfo: { accid, openid }
    } = this.props;
    const loadPddGoodsAsync = dispatch(goodsActions.loadPddGoodsAsync(accid));
    const loadBannerAsync = dispatch(bannersActions.loadBannerAsync(accid, openid));
    Promise.all([loadPddGoodsAsync, loadBannerAsync])
      .then(() => {
        Taro.stopPullDownRefresh();
        // 清除banner进屏日志记录标志
        this.clearBannerId();
      })
      .catch(() => {
        Taro.stopPullDownRefresh();
      });
  }

  onReachBottom() {
    const { selectedOpt, goodsByOpt } = this.props.goods;
    const { loading, loadingByScroll, noMore } = goodsByOpt[selectedOpt];
    // 限制10页
    if (loading || loadingByScroll || noMore) {
      return;
    }
    this.setState({
      isReachBottom: true
    });
  }

  handleSearchClick() {
    Log.click({ buttonfid: 'xq_10104' });
    jumpUrl('/pages/home/search/search?focus=true');
  }

  onPageScroll({ scrollTop }) {
    if (scrollTop >= this.referrenceTop - this.stBarHeight) {
      if (!this.state.showTitleBarSearch) {
        this.setState({
          showTitleBarSearch: true
        });
      }
    } else {
      if (this.state.showTitleBarSearch) {
        this.setState({
          showTitleBarSearch: false
        });
      }
    }
    if (scrollTop >= this.tabsTop - this.tabsHeight - this.stBarHeight) {
      if (!this.state.fixedTabsList) {
        this.setState({
          fixedTabsList: true
        });
      }
    } else {
      if (this.state.fixedTabsList) {
        this.setState({
          fixedTabsList: false
        });
      }
    }
  }
  // 获取剪贴板内容并执行判断逻辑。
  getClipboardData() {
    const clipboardData = getGlobalData('clipboard_data');
    Taro.getClipboardData().then(({ data }) => {
      if (
        !data ||
        data.length < 12 ||
        clipboardData === data ||
        data.indexOf('p.pinduoduo.com') >= 0 ||
        data.indexOf('u.jd.com') >= 0
      ) {
        return;
      }
      setGlobalData('clipboard_data', data);
      this.setState({
        clipboardData: data
      });
      if (data.indexOf('yangkeduo.com') !== -1 || data.indexOf('toutiaonanren.com') !== -1) {
        // PDD
        this.loadSearchData('pdd', data);
      } else if (data.indexOf('jd.com') !== -1) {
        // JD
        this.loadSearchData('jd', data);
      } else {
        this.setState({
          showSearchModal: true,
          showSearchGoodsModal: false
        });
      }
      Log.click({ buttonfid: 'xq_10100' });
    });
  }

  async loadSearchData(union, kw) {
    const { dispatch } = this.props;
    dispatch(searchActions.changeOpt(union));
    await dispatch(searchActions.loadAsync(kw, this.props.loginInfo.accid));
    const { selectedOpt: searchSelectedOpt, goodsByOpt: searchGoodsByOpt } = this.props.search;
    const searchGoods = searchGoodsByOpt[searchSelectedOpt] ? searchGoodsByOpt[searchSelectedOpt].data[0] : '';
    if (searchGoods) {
      this.setState({
        showSearchModal: false,
        showSearchGoodsModal: true
      });
    } else {
      this.setState({
        showSearchModal: true,
        showSearchGoodsModal: false
      });
    }
  }

  // 跳转搜索
  jumpSearch(union) {
    Log.click({ buttonfid: 'xq_10101' });
    if (union === 'tb') {
      Log.click({ buttonfid: 'xq_10160' });
    }
    console.log('union', union);
    this.props.dispatch(searchActions.changeOpt(union));
    jumpUrl(`/pages/home/search/search?kw=${encodeURIComponent(this.state.clipboardData)}`);
  }

  handleTabsClick(id, e) {
    const singleWidth = 52; // 单个tab宽度52px，不同设备可能表现有点差异，对体验影响小。
    const { windowWidth } = getGlobalData('system_info');
    this.setState({
      currentTab: id,
      tabsScrollLeft: e.currentTarget.offsetLeft + singleWidth / 2 - windowWidth / 2
    });
    const {
      loginInfo: { accid }
    } = this.props;
    const { showTb } = this.state;
    if (showTb) {
      this.props.dispatch(goodsActions.loadClear());
      if (this.id === id) {
        this.props.dispatch(goodsActions.getRank()); //调用rank接口
      } else {
        this.props.dispatch(goodsActions.loadTbGoodsAsync(id));
      }
      Log.click({ buttonfid: 'xq_10151', buttonsid: id });
    } else {
      this.props.dispatch(goodsActions.changeOpt(id));
      this.props.dispatch(goodsActions.loadPddGoodsAsync(accid));
      if (id === 1) {
        id = 14;
      }
      Log.click({ buttonfid: 'xq_10180', buttonsid: id });
    }
  }
  handleBannersData = banners => {
    return (
      banners.length > 0 &&
      banners.map(d => {
        const { title, openType, openUrl, subjectId, productId, platform } = d;
        let url = '';
        // 打开方式：1.专题列表 2,商品详情,3.指定页面(如活动页)
        if (openType === 1) {
          url = `/pages/home/hotGoods/hotGoods?title=${title}&id=${subjectId}&type=mix`;
        } else if (openType === 2) {
          let urlPath = '';
          switch (platform) {
            case 1:
              urlPath = '/pages/details/pdd/pdd';
              break;
            case 2:
              urlPath = '/pages/details/jd/jd';
              break;
            case 3:
              urlPath = '/pages/zy/details/details';
              break;
            default:
              urlPath = '/pages/details/pdd/pdd';
          }
          url = `${urlPath}?id=${productId}`;
        } else if (openType === 3) {
          url = openUrl.substr(0, 1) !== '/' ? '/' + openUrl : openUrl;
        }
        return {
          ...d,
          url
        };
      })
    );
  };
  handleBannerClick(item, type) {
    if (type === 'mxg_syzp') {
      let url = `/pages/home/themeList/themeListTbDiy?title=${
        item.title
      }&id=13&bgcolor=#45c0ff&banner=${encodeURIComponent(
        'https://h5.suixingou.com/miniprogram-assets/sxgqq/theme/tbbanner.jpg'
      )}&sort=${item.sort}&subjectId=${item.subjectId}&type=mxg_syzp`;
      if (item.goodsid) {
        jumpUrl(`/pages/details/pdd/pdd?id=${item.goodsid}`);
      } else {
        jumpUrl(url);
      }
      return;
    }
    if (item.goodsid) {
      jumpUrl(`/pages/details/details?id=${item.goodsid}`);
    } else {
      let url = `/pages/home/themeList/themeListTbDiy?title=${
        item.title
      }&id=13&bgcolor=#45c0ff&banner=${encodeURIComponent(
        'https://h5.suixingou.com/miniprogram-assets/sxgqq/theme/tbbanner.jpg'
      )}&sort=${item.sort}&subjectId=${item.subjectId}`;
      jumpUrl(url);
    }
  }
  render() {
    const {
      showTitleBarSearch,
      showSearchModal,
      showSearchGoodsModal,
      clipboardData,
      show99Modal,
      showHbModal,
      showOpenedHbModal,
      currentTab,
      tabsScrollLeft,
      isReachBottom,
      fixedTabsList,
      showTb
    } = this.state;
    const {
      goods,
      search,
      loginInfo: { accid },
      listcategory,
      queryConfig,
      tabs
    } = this.props;
    const { SubjectInfo } = queryConfig;
    const { selectedOpt, goodsByOpt } = goods;
    const { data: goodsList, loading, loadingByScroll, noMore } = goodsByOpt[selectedOpt] || {};
    const { selectedOpt: searchSelectedOpt, goodsByOpt: searchGoodsByOpt } = search;
    const searchGoods = searchGoodsByOpt[searchSelectedOpt] ? searchGoodsByOpt[searchSelectedOpt].data[0] : {};
    const tabItems = null;
    // tabs标签
    if (showTb) {
      tabItems = Object.entries(listcategory.data).map(tab => (
        <View
          id={`tab${tab[0]}`}
          key={tab[0]}
          className={currentTab === tab[0] ? 'tabs-item active' : 'tabs-item'}
          onClick={this.handleTabsClick.bind(this, tab[0])}
        >
          {tab[1]}
        </View>
      ));
    } else {
      tabItems = SubjectInfo.filter((item, index) => {
        if (index === 0 || index === 1) {
          return false;
        } else {
          return true;
        }
      }).map((tab, index) => (
        <View
          id={`tab${index}`}
          key={tab.id}
          className={currentTab === tab.id ? 'tabs-item active' : 'tabs-item'}
          onClick={this.handleTabsClick.bind(this, tab.id)}
        >
          {tab.name}
        </View>
      ));
    }

    //专题图标icon-list
    const mxg_ggdh = null;
    if (!showTb) {
      mxg_ggdh =
        queryConfig.data.mxg_ggdh &&
        queryConfig.data.mxg_ggdh
          .sort(function(item, item2) {
            return item.sort - item2.sort;
          })
          .map((item, index) => {
            if (!this.option99) {
              this.option99 = {
                title: item.title,
                sort: item.sort,
                subjectId: item.subjectId
              };
            }
            let url = `/pages/home/themeList/themeListTbDiy?title=${
              item.title
            }&id=13&bgcolor=#45c0ff&banner=${encodeURIComponent(
              'https://h5.suixingou.com/miniprogram-assets/sxgqq/theme/tbbanner.jpg'
            )}&sort=${item.sort}&subjectId=${item.subjectId}`;
            if (index === 0) {
              this.url = `/pages/home/themeList/themeListTbDiy?title=${
                item.title
              }&id=13&bgcolor=#45c0ff&banner=${encodeURIComponent(
                'https://h5.suixingou.com/miniprogram-assets/sxgqq/theme/tbbanner.jpg'
              )}&sort=${item.sort}&subjectId=${item.subjectId}`; //9.9包邮 点红包需要跳转
            }
            return (
              <View
                key={item.buyPid}
                className='item'
                onClick={() => {
                  let buttonsid = '';
                  if(index === 0 )  {
                    buttonsid = 'type1010';
                  } else  if(index === 1) {
                    buttonsid = 'type1011';
                  } else  if(index === 2) {
                    buttonsid = 'type1012';
                  }
                  Log.click({ buttonfid: 'xq_10153', buttonsid });
                  jumpUrl(url);
                }}
              >
                <Image className='icon' src={item.bannerPicUrl} />
                <Text className='txt'>{item.title}</Text>
              </View>
            );
          });
    } else {
      mxg_ggdh =
        queryConfig.data.mxg_ggdh &&
        queryConfig.data.mxg_ggdh
          .sort(function(item, item2) {
            return item.sort - item2.sort;
          })
          .map(item => {
            if (!this.option99) {
              this.option99 = {
                title: item.title,
                sort: item.sort,
                subjectId: item.subjectId
              };
            }
            let url = `/pages/home/themeList/themeListTbDiy?title=${
              item.title
            }&id=13&bgcolor=#45c0ff&banner=${encodeURIComponent(
              'https://h5.suixingou.com/miniprogram-assets/sxgqq/theme/tbbanner.jpg'
            )}&sort=${item.sort}&subjectId=${item.subjectId}`;
            return (
              <View
                key={item.buyPid}
                className='item'
                onClick={() => {
                  Log.click({ buttonfid: 'xq_10150', buttonsid: item.sort });
                  jumpUrl(url);
                }}
              >
                <Image className='icon' src={item.bannerPicUrl} />
                <Text className='txt'>{item.title}</Text>
              </View>
            );
          });
    }
    //中部banners
    const bannerSwiperItem = null;
    if (showTb) {
      bannerSwiperItem =
        queryConfig.data.mxg_symid &&
        queryConfig.data.mxg_symid
          .sort(function(item, item2) {
            return item.sort - item2.sort;
          })
          .map(item => {
            const { bannerId, bannerPicUrl } = item;
            return (
              <SwiperItem
                key={bannerId}
                className='swiper-item-banner'
                itemId={bannerId}
                onClick={() => {
                  Log.click({ buttonfid: 'xq_10152', buttonsid: item.sort });
                  this.handleBannerClick(item, 'mxg_syzp');
                }}
              >
                <Image className='pic' src={bannerPicUrl} />
              </SwiperItem>
            );
          });
    } else {
      /* bannerSwiperItem = (
        <SwiperItem
          className='swiper-item-banner'
          onClick={() => {
            Log.click({ buttonfid: 'xq_10105', buttonsid: 'type1006' });
            jumpUrl('/pages/home/hotGoods/hotGoods?title=京仓京配&id=15&type=jd');
          }}
        >
          <Image className='pic' src='https://h5.suixingou.com/miniprogram-assets/sxgqq/jd/banner.png' />
        </SwiperItem>
      ); */
      bannerSwiperItem =
        queryConfig.data.mxg_symid &&
        queryConfig.data.mxg_symid.map(item => {
          const { bannerId, bannerPicUrl } = item;
          return (
            <SwiperItem
              key={bannerId}
              className='swiper-item-banner'
              itemId={bannerId}
              onClick={() => {
                Log.click({ buttonfid: 'xq_10179', buttonsid: item.sort });
                this.handleBannerClick(item, 'mxg_syzp');
              }}
            >
              <Image className='pic' src={bannerPicUrl} />
            </SwiperItem>
          );
        });
    }
    //⾸⻚瓷⽚区
    const mxg_syzp = null;
    if (showTb) {
      mxg_syzp =
        queryConfig.data.mxg_syzp &&
        queryConfig.data.mxg_syzp
          .sort(function(item, item2) {
            return item.sort - item2.sort;
          })
          .map(item => {
            const { bannerId, bannerPicUrl } = item;
            return (
              <View
                className='li'
                key={bannerId}
                onClick={() => {
                  Log.click({ buttonfid: 'xq_10180', buttonsid: item.sort });
                  this.handleBannerClick(item, 'mxg_syzp');
                }}
              >
                <Image className='img' src={bannerPicUrl} />
              </View>
            );
          });
    } else {
      //京东数据
      /* mxg_syzp = (
        <Block>
          <View
            className='li'
            onClick={() => {
              Log.click({ buttonfid: 'xq_10105', buttonsid: 'type1007' });
              jumpUrl('/pages/home/brandGoods/brandGoods');
            }}
          >
            <Image className='img' src='https://h5.suixingou.com/miniprogram-assets/sxgqq/jd/card1.png' />
          </View>
          <View
            className='li'
            onClick={() => {
              Log.click({ buttonfid: 'xq_10105', buttonsid: 'type1008' });
              jumpUrl('/pages/home/hotGoods/hotGoods?title=京东超市&id=6&type=jd');
            }}
          >
            <Image className='img' src='https://h5.suixingou.com/miniprogram-assets/sxgqq/jd/card2.png' />
          </View>
        </Block>
      ); */
      //pdd
      mxg_syzp = (
        <Block>
          <View
            className='li'
            onClick={() => {
              Log.click({ buttonfid: 'xq_10180', buttonsid: SubjectInfo[0].id });
              jumpUrl(
                `/pages/home/themeList/themeListPdd?title=${SubjectInfo[0].name}&id=${SubjectInfo[0].id}&bgcolor=${
                  SubjectInfo[0].back_color
                }&banner=${encodeURIComponent(SubjectInfo[0].img_url)}`
              );
            }}
          >
            <Image className='img' src='https://h5.suixingou.com/miniprogram-assets/sxgqq/qq/banner-cp1.png' />
          </View>
          <View
            className='li'
            onClick={() => {
              Log.click({ buttonfid: 'xq_10180', buttonsid: SubjectInfo[1].id });
              jumpUrl(
                `/pages/home/themeList/themeListPdd?title=${SubjectInfo[1].name}&id=${SubjectInfo[1].id}&bgcolor=${
                  SubjectInfo[1].back_color
                }&banner=${encodeURIComponent(SubjectInfo[1].img_url)}`
              );
            }}
          >
            <Image className='img' src='https://h5.suixingou.com/miniprogram-assets/sxgqq/qq/banner-cp2.png' />
          </View>
        </Block>
      );
    }
    return (
      <View className='page-container' style={{ marginTop: Taro.pxTransform(getGlobalData('titlebar_height')) }}>
        <View className='home' style={{ marginTop: `-${Taro.pxTransform(getGlobalData('titlebar_height'))}` }}>
          {/* 搜索 */}
          <TitleBar
            homePage
            bgstyle={showTitleBarSearch ? '' : 'transparent'}
            fontstyle='light'
            bgCol={showTitleBarSearch ? '#ffe465' : ''}
            isOpenTb={this.state.showTb}
          />
          {/* 搜索 */}
          <View
            className='top'
            style={{
              paddingTop: Taro.pxTransform(getGlobalData('titlebar_height')),
              height: Taro.pxTransform(this.isIpx ? 400 : 352)
            }}
          >
            <View className='search-wrap'>
              <View className='search' onClick={this.handleSearchClick}>
                <Image className='icon' src={iconsearch} />
                <Text className='txt'>复制商品标题 领优惠券再返利</Text>
              </View>
              <View className='btn'>搜券</View>
            </View>
          </View>
          {/* 4个热门菜单 */}
          <View className='icon-list'>
            <View
              className='item'
              onClick={() => {
                Log.click({ buttonfid: 'xq_10153', buttonsid: 'type1009' });
                if (accid) {
                  this.setState({
                    show99Modal: true
                  });
                } else {
                  this.setState({
                    showHbModal: true
                  });
                }
              }}
            >
              <Image className='icon' src={qq20year} />
              <Text className='txt'>新人红包</Text>
            </View>
            {mxg_ggdh}
          </View>
          {/* 活动banner */}
          <View className='banner-wrap' /* style={`${bannersData.length === 0 && 'height:0;margin-top:0;'}`} */>
            <Swiper
              className='swiper-banner'
              autoplay
              circular
              interval='3000' /* onChange={this.handleBannerChange} */
            >
              {bannerSwiperItem}
            </Swiper>
          </View>
          <View className='sec-card'>{mxg_syzp}</View>
          {/* 商品分类tabs */}
          {fixedTabsList && <View className='tabs-list-empty' />}
          <ScrollView
            className='tabs-list'
            style={
              fixedTabsList
                ? {
                    position: 'fixed',
                    top: Taro.pxTransform(getGlobalData('titlebar_height')),
                    marginTop: 0,
                    backgroundColor: '#ffffff',
                    backgroundImage: 'none',
                    boxShadow: '0 0 3px #f0f0f0',
                    zIndex: 1
                  }
                : {}
            }
            scrollX
            scrollWithAnimation
            scrollLeft={tabsScrollLeft}
          >
            {tabItems}
          </ScrollView>
          {/* 商品列表 */}
          <View className='goods-list'>
            {loading && goodsList && goodsList.length === 0 && <Loading />}
            {goodsList && goodsList.length > 0 && (
              <GoodsList
                goodsList={goodsList}
                union={showTb ? 'tb' : 'pdd'}
                onClick={gds => {
                  if (showTb) {
                    jumpUrl(`/pages/details/details?id=${gds.id}`);
                  } else {
                    jumpUrl(`/pages/details/pdd/pdd?id=${gds.id}`);
                  }
                }}
              />
            )}
            {!loading && loadingByScroll && !noMore && <Loading />}
            {!loading && !loadingByScroll && noMore && <NoMore />}
          </View>
          {/* 信息流底部分割线 */}
          {isReachBottom && <NoMore txt='~我是有底线的~' />}
          {/* 搜索弹窗 */}
          {showSearchModal && (
            <View className='search-modal-wrap'>
              <View className='search-modal'>
                <View className='search-modal-header'>
                  <Image
                    className='img'
                    mode='widthFix'
                    src='https://h5.suixingou.com/miniprogram-assets/sxgqq/qq/top@3x.png'
                  />
                </View>
                <View className='search-modal-content'>
                  <View className='search-modal-content-title'>{clipboardData}</View>
                  <View className='search-modal-content-split-line' />
                  <View className='search-modal-content-union'>
                    {this.state.showTb && (
                      <View className='item search-modal-content-union-tb' onClick={this.jumpSearch.bind(this, 'tb')}>
                        <View className='img' />
                        <View className='txt'>淘宝</View>
                      </View>
                    )}
                    <View className='item search-modal-content-union-pdd' onClick={this.jumpSearch.bind(this, 'pdd')}>
                      <View className='img' />
                      <View className='txt'>拼多多</View>
                    </View>
                    <View className='item search-modal-content-union-jd' onClick={this.jumpSearch.bind(this, 'jd')}>
                      <View className='img' />
                      <View className='txt'>京东</View>
                    </View>
                  </View>
                </View>
                <View
                  className='search-modal-close'
                  onClick={() => {
                    Log.click({ buttonfid: 'xq_10102' });
                    this.setState({
                      showSearchModal: false
                    });
                  }}
                />
              </View>
            </View>
          )}
          {/* 搜索商品弹窗 */}
          {showSearchGoodsModal && (
            <View className='search-goods-modal-wrap'>
              <View className='search-goods-modal'>
                <View className='search-goods-modal-banner'>
                  <Image className='img' src={searchGoods.thumbnail} mode='widthFix' />
                </View>
                <View className='search-goods-modal-info'>
                  <View className='search-goods-modal-info-title'>
                    {searchGoods.name}
                    <View className={`union ${searchSelectedOpt}`} />
                  </View>
                  <View className='search-goods-modal-info-price'>
                    <View className='new'>
                      <Text className='label'>券后价：￥</Text>
                      <Text className='price'>{searchGoods.newPrice}</Text>
                    </View>
                    <Text className='old'>原价￥{searchGoods.oldPrice}</Text>
                  </View>
                  <View className='search-goods-modal-info-commission'>
                    <View className='commission'>
                      <View className='label'>下单后</View>
                      <View className='earn'>返利{searchGoods.commission}</View>
                    </View>
                    <View className='coupon'>券￥{searchGoods.coupon}</View>
                  </View>
                </View>
                <View className='search-goods-modal-btns'>
                  <View
                    className='btn search'
                    onClick={() => {
                      jumpUrl(`/pages/home/search/search?kw=${searchGoods.name}`);
                    }}
                  >
                    更多搜索
                  </View>
                  <View
                    className='btn details'
                    onClick={() => {
                      if (searchSelectedOpt === 'pdd') {
                        jumpUrl(`/pages/details/pdd/pdd?id=${searchGoods.id}`);
                      } else {
                        jumpUrl(`/pages/details/jd/jd?id=${searchGoods.id}`);
                      }
                    }}
                  >
                    立即领券
                  </View>
                </View>
                {/* 关闭 */}
                <View
                  className='search-goods-modal-close'
                  onClick={() => {
                    this.setState({
                      showSearchGoodsModal: false
                    });
                  }}
                />
              </View>
            </View>
          )}
          {/* 分享按钮 */}
          <View className='share-btn'>
            <Button
              openType='share'
              className='btn'
              onClick={() => {
                Log.click({ buttonfid: 'xq_10161' });
              }}
            />
          </View>
          {/* 9块9活动弹窗（针对新老用户） */}
          {show99Modal && (
            <View
              className='popup-modal-wrap'
              onClick={e => {
                e.preventDefault;
                Log.click({ buttonfid: 'xq_10151' });
                this.setState({ show99Modal: false });
              }}
            >
              <Image
                className='img-center'
                src='https://h5.suixingou.com/miniprogram-assets/sxgqq/home/popfou.png'
                onClick={() => {
                  Log.click({ buttonfid: 'xq_10151' });
                  this.setState({ show99Modal: false });

                  /* if (!showTb) {
                    jumpUrl(this.url);
                  } else {
                    jumpUrl(
                      `/pages/home/themeList/themeListTbDiy?title=${
                        this.option99.title
                      }&id=13&bgcolor=#45c0ff&banner=${encodeURIComponent(
                        'https://h5.suixingou.com/miniprogram-assets/sxgqq/theme/tbbanner.jpg'
                      )}&sort=${this.option99.sort}&subjectId=${this.option99.subjectId}`
                    );
                  } */
                }}
              />
            </View>
          )}
          {/* 红包弹窗1 */}
          <AtModal isOpened={showHbModal} confirmText=' '>
            <Button openType='getUserInfo' className='btn' onGetUserInfo={this.onAuthConfirmClick.bind(this)}>
              <Image
                className='img'
                src='https://h5.suixingou.com/miniprogram-assets/sxgqq/boost/no-open-hb.png'
                mode='widthFix'
              />
            </Button>
          </AtModal>
          {/* 红包弹窗2 */}
          <AtModal isOpened={showOpenedHbModal} confirmText=' '>
            <Image
              className='img'
              src='https://h5.suixingou.com/miniprogram-assets/sxgqq/boost/opened-hb.png'
              mode='widthFix'
              onClick={() => {
                this.setState({ showOpenedHbModal: false });
                if (!showTb) {
                  jumpUrl(this.url);
                } else {
                  jumpUrl(
                    `/pages/home/themeList/themeListTbDiy?title=${
                      this.option99.title
                    }&id=13&bgcolor=#45c0ff&banner=${encodeURIComponent(
                      'https://h5.suixingou.com/miniprogram-assets/sxgqq/theme/tbbanner.jpg'
                    )}&sort=${this.option99.sort}&subjectId=${this.option99.subjectId}`
                  );
                }
              }}
            />
          </AtModal>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { goods, search, banners, listcategory, queryConfig, tabs } = state.home;
  const { userInfo } = state.mine;
  const { loginInfo } = state.login;
  return {
    goods,
    userInfo,
    loginInfo,
    search,
    banners,
    listcategory,
    queryConfig,
    tabs
  };
}

export default connect(mapStateToProps)(Home);
