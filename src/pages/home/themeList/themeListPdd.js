import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image } from '@tarojs/components';
import GoodsList from '../../../components/goods/goodsList';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import { themeListPddActions, goodsActions } from '../../../redux/modules/home';

import './themeList.scss';

class ThemeList extends Component {
  config = {
    navigationBarTitleText: ''
  };

  constructor() {
    super(...arguments);
    this.state = {
      banner: ''
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { title = '商品列表', id, banner, bgcolor = '#ffffff' } = this.$router.params;
    this.id = id;
    Taro.setNavigationBarTitle({
      title
    });
    this.setState({
      banner,
      bgcolor
    });
    dispatch(themeListPddActions.loadThemeListAsync(id, getGlobalData('sxg_accid')));
  }

  componentWillUnmount() {
    // 页面卸载时，清空数据
    this.props.dispatch(themeListPddActions.clearThemeList());
  }
  /* onReachBottom() {
    const { dispatch } = this.props;
    dispatch(themeListPddActions.loadThemeListAsync(this.id, getGlobalData('sxg_accid')));
  } */
  render() {
    const { banner, bgcolor } = this.state;
    const { goodsList } = this.props;
    return (
      <View className='page-container'>
        <View className='theme-list'>
          <View className='banner-wrap'>
            <Image className='banner' src={banner} />
          </View>
          {/* 商品列表 */}
          <View className='goods-list' style={{ backgroundColor: bgcolor }}>
            <GoodsList
              style={{ paddingTop: 0 }}
              goodsList={goodsList}
              union='pdd'
              onClick={gds => {
                jumpUrl(`/pages/details/pdd/pdd?id=${gds.id}`);
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { themeListPdd } = state.home;
  return {
    goodsList: themeListPdd.data
  };
}

export default connect(mapStateToProps)(ThemeList);
