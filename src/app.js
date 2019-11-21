import '@tarojs/async-await';
import Taro, { Component } from '@tarojs/taro';
import { Provider } from '@tarojs/redux';
import {
  getSystemInfo,
  setGlobalData,
  loginAndConnection,
  saveOthersInvitecode,
  getCloudOptions
  // getGlobalData
} from './utils/wx';
import Log from './utils/log';
// import { compareVersion } from './utils/util';
import { getScene } from './utils/api';
import Home from './pages/home/home';
import { loginInfoActions } from './redux/modules/login/index';
// import { userInfoActions } from './redux/modules/mine/index';
import { QID, DEFAULT_QID } from './constants/index';
import configStore from './redux/store';
import './app.scss';

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

const store = configStore();

class App extends Component {
  config = {
    pages: [
      'pages/home/home', //首页
      'pages/home/search/search', //搜索页面
      'pages/home/hotGoods/hotGoods', //今日爆款
      'pages/home/activity/activity', //活动
      'pages/home/mailingFree/mailingFree', //9.9包邮
      'pages/home/brandGoods/brandGoods', //品牌好货
      'pages/home/themeList/themeList', //主题 点击icon进入
      'pages/home/themeList/themeListTb', //淘宝主题列表
      'pages/home/themeList/themeListTbDiy', //pdd主题列表
      'pages/home/themeList/themeListPdd', //自定义主题页面
      'pages/home/courses/novice', //新手教程
      'pages/home/courses/novice1', //购物教程
      'pages/details/details', //详情
      'pages/details/pdd/pdd', //拼多多
      'pages/details/jd/jd', //京东
      'pages/mine/mine', //我的页面
      'pages/mine/order/order', //订单
      'pages/mine/orderretrieve/orderretrieve', //订单找回
      'pages/mine/balance/balance', //余额明细
      'pages/mine/verifphone/verifphone', //手机号绑定
      'pages/mine/withdraw/withdraw', //确认提现
      'pages/login/login', //登陆
      'pages/boost/boost', //助力分享
      'pages/boost/boostHelp' //帮ta助力
    ],
    window: {
      backgroundTextStyle: 'dark',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '魔性购',
      onReachBottomDistance: 100,
      //navigationStyle: 'default',
      navigationBarTextStyle: 'black'
    },
    tabBar: {
      color: '#666666',
      selectedColor: '#333333',
      backgroundColor: '#ffffff',
      list: [
        {
          pagePath: 'pages/home/home',
          text: '首页',
          iconPath: 'asset/home.png',
          selectedIconPath: 'asset/home_active.png'
        },
        {
          pagePath: 'pages/mine/mine',
          text: '我的',
          iconPath: 'asset/mine.png',
          selectedIconPath: 'asset/mine_active.png'
        }
      ]
    },
    navigateToMiniProgramAppIdList: [
      // 'wx32540bd863b27570', // 拼多多
      // 'wx8ba18d69517bb09d', // 东方头条新闻
      // 'wx13e41a437b8a1d2e' // 京东爆品推荐
    ],
    usingComponents: {},
    // cloud: true,
    networkTimeout: {
      request: 10000,
      connectSocket: 10000,
      uploadFile: 10000,
      downloadFile: 10000
    }
  };

  async componentWillMount() {
    console.log('SystemInfo>>', getSystemInfo());
    // 缓存系统信息
    setGlobalData('system_info', getSystemInfo());

    // 缓存titleBar高度信息
    const { statusBarHeight } = getSystemInfo();
    const stBarHeight = statusBarHeight * 2;
    const navBarHeight = 88;
    setGlobalData('statusbar_height', stBarHeight);
    setGlobalData('navbar_height', navBarHeight);
    setGlobalData('titlebar_height', stBarHeight + navBarHeight);
    // console.error('***titlebar_height***');
    // console.error(getGlobalData('statusbar_height'));
    // console.error(getGlobalData('titlebar_height'));
    // console.error('***titlebar_height***');

    try {
      // 上报启动日志
      const {
        path,
        query: { id, scene }
      } = this.$router.params;
      let opentype = 5;
      let opentypevalue = path;
      if (path === 'pages/details/pdd/pdd') {
        opentype = 3;
        opentypevalue = id;
      } else if (path === 'pages/details/jd/jd') {
        opentype = 4;
        opentypevalue = id;
      }
      // 二维码分享的情况
      if (!id && scene) {
        let dscene = await getScene(scene);
        opentypevalue = dscene.id;
      }
      // 由于淘宝页面也存在scene的情况
      if (path === 'pages/details/details') {
        opentype = 5;
        opentypevalue = path;
      }
      Log.online({ opentype, opentypevalue });
    } catch (error) {
      console.error('上报启动日志出错：', error);
    }

    // 如已有新版本发布，提示用户更新操作
    const updateManager = Taro.getUpdateManager();
    updateManager.onUpdateReady(function() {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      });
    });
  }

  async componentDidMount() {
    // 登录（前端）并建立关联（后端）
    store.dispatch(loginInfoActions.load());
    const login = loginAndConnection();
    setGlobalData('login', login);
    let data = await login;
    store.dispatch(loginInfoActions.saveLoginInfo(data));

    setGlobalData('cloudControlPromise', getCloudOptions());

    //saveMyInvitecode();
  }

  async componentDidShow() {
    try {
      // 缓存qid和上报启动日志（生命周期内）
      const {
        query: { qid, appqid, id, scene }
      } = this.$router.params;
      let qd = qid || appqid || DEFAULT_QID;
      // 二维码分享的情况
      if (!id && scene) {
        let dscene = await getScene(scene);
        qd = dscene.qid;
      }
      setGlobalData(QID, qd);
    } catch (error) {
      console.error('缓存qid出错：', error);
    }
    saveOthersInvitecode.call(this);
  }

  // componentDidHide() {}

  // componentCatchError() {}

  // componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Home />
      </Provider>
    );
  }
}

Taro.render(<App />, document.getElementById('app'));
