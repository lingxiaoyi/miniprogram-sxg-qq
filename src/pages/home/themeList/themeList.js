import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image } from '@tarojs/components';
import GoodsList from '../../../components/goods/goodsList';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import { themeListActions } from '../../../redux/modules/home';

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
    Taro.setNavigationBarTitle({
      title
    });
    this.setState({
      title,
      banner,
      bgcolor
    });
    dispatch(themeListActions.loadThemeListAsync(id, getGlobalData('sxg_accid')));
  }

  componentWillUnmount() {
    // 页面卸载时，清空数据
    this.props.dispatch(themeListActions.clearThemeList());
  }

  render() {
    const { title, banner, bgcolor } = this.state;
    const { goodsList } = this.props;
    // const top = Taro.pxTransform((getGlobalData('system_info').isIpx ? 48 : 0) + 128);
    return (
      <View className='page-container'>
        <View className='theme-list'>
          {/* titlebar */}
          {/* <TitleBar title={title} /> */}
          {/* banner */}
          <View className='banner-wrap'>
            <Image className='banner' src={banner} />
          </View>
          {/* 商品列表 */}
          <View className='goods-list' style={{ backgroundColor: bgcolor }}>
            <GoodsList
              style={{ paddingTop: 0 }}
              goodsList={goodsList}
              union='pdd'
              onClick={goods => {
                jumpUrl(`/pages/details/pdd/pdd?id=${goods.id}`);
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { themeList } = state.home;
  return {
    goodsList: themeList.data
  };
}

export default connect(mapStateToProps)(ThemeList);
