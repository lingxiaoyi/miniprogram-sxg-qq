import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image } from '@tarojs/components';
import GoodsList from '../../../components/goods/goodsList';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import { themeListActions, themeListPddActions } from '../../../redux/modules/home';
import './themeList.scss';

class ThemeList extends Component {
  config = {
    navigationBarTitleText: '魔性购',
    navigationStyle: 'default',
    navigationBarBackgroundColor: '#ffffff'
  };

  constructor() {
    super(...arguments);
    this.state = {
      selectedOpt: 'tb'
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const {
      title = '商品列表',
      /* banner, bgcolor = '#ffffff', */ sort = '2',
      subjectId = '83',
      type
    } = this.$router.params;
    Taro.setNavigationBarTitle({
      title
    });
    /* this.setState({
      title,
      banner,
      bgcolor
    }); */

    if (type === 'mxg_syzp') {
      dispatch(themeListActions.loadThemeListSpecialCateAsync2('1', subjectId));
    } else if (sort === '2' || sort === '1') {
      this.pagetype = '2'; //9.9包邮 第2个图标
      this.id = '0';
      dispatch(themeListActions.loadThemeListSpecialCateAsync('1', subjectId));
      // dispatch(themeListActions.loadThemeListTbAsync());
    } else if (sort === '3') {
      this.id = '1';
      dispatch(themeListActions.loadThemeListSpecialCateAsync('1', subjectId));
      //dispatch(themeListActions.loadThemeListhighsalesvolumerankAsync());
    } else if (sort === '4') {
      this.id = '2';
      this.pagetype = '4'; //拼多多券 第4个图标
      dispatch(themeListActions.loadThemeListSpecialCateAsync('1', subjectId));
      //dispatch(themeListActions.requestHotGoods()); //拼多多/top_goods_list

    }
    this.setState({
      selectedOpt: 'pdd'
    });
    dispatch(themeListPddActions.loadThemeListAsync(this.id, getGlobalData('sxg_accid')));
  }
 /*  onReachBottom() {
    const { dispatch } = this.props;
    dispatch(themeListPddActions.loadThemeListAsync(this.id, getGlobalData('sxg_accid')));
     if (this.pagetype === '2') {
      dispatch(themeListActions.loadThemeListTbAsync());
    } else if (this.pagetype === '4') {
      dispatch(themeListActions.requestHotGoods());
    }
  } */
  componentWillUnmount() {
    // 页面卸载时，清空数据
    this.props.dispatch(themeListPddActions.clearThemeList());
  }
  render() {
    const { selectedOpt } = this.state;
    const { goodsList, option } = this.props;
    console.log('option', option);
    return (
      <View className='page-container'>
        <View className='theme-list'>
          <View className='banner-wrap'>
            <Image className='banner' src={option.spImg} />
          </View>
          {/* 商品列表 */}
          <View className='goods-list' style={{ backgroundColor: option.backColor, paddingTop: '20rpx' }}>
            <GoodsList
              style={{ paddingTop: 0 }}
              goodsList={goodsList}
              union={selectedOpt}
              onClick={gds => {
                if (selectedOpt === 'tb') {
                  jumpUrl(`/pages/details/details?id=${gds.id}`);
                } else if (selectedOpt === 'pdd') {
                  jumpUrl(`/pages/details/pdd/pdd?id=${gds.id}`);
                } else {
                  jumpUrl(`/pages/details/jd/jd?id=${gds.id}`);
                }
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { themeList, themeListPdd } = state.home;
  return {
    goodsList: themeListPdd.data,
    option: themeList.option
  };
}

export default connect(mapStateToProps)(ThemeList);
