console.log('当前环境：', process.env.NODE_ENV);
let HOST = 'https://qqucenter.suixingou.com';
let LOGHOST = 'https://logshangbao.maiyariji.com';
let GOODS_HOST = 'https://abc.suixingou.com';
let MAIYARIJI_HOST = 'https://qqxqy.suixingou.com';
let EWM_HOST = 'https://wxacode.suixingou.com:8083';
let TASKCENTER_HOST = 'https://taskcenter.suixingou.com:8073';
let ZL_HOST = 'https://sxgqqxcx.suixingou.com/';
let SOUSUO_HOST = 'https://qqsousuo.suixingou.com';
let TKL_HOST = 'https://tkl.suixingou.com';
let APP_HOST = 'https://peizhixx.suixingou.com'; //配置信息
let SXGAPI_HOST = 'https://sxgapi.suixingou.com:8053';
if (process.env.NODE_ENV === 'development') {
  /* HOST = 'https://qqucentertest.suixingou.com';
  GOODS_HOST = 'https://abc.suixingou.com'; //'https://abctest.suixingou.com:4443';
  LOGHOST = 'https://qqucentertest.suixingou.com';
  MAIYARIJI_HOST = 'https://qqxqy.suixingou.com'; // 'http://106.75.35.140'
  TASKCENTER_HOST = 'https://test.mv.dftoutiao.com/taskcenter';
  ZL_HOST = 'https://test.mv.dftoutiao.com/qqxcx';
  SOUSUO_HOST = 'http://106.75.35.140';
  TKL_HOST = 'http://106.75.35.140';
  APP_HOST = 'http://39.107.113.9';
  SXGAPI_HOST = 'https://test.mv.dftoutiao.com/api'; */
}
const URL = {
  loginByOpenid: `${HOST}/ucenter_my_qqmini_new/myuser/otherlogin`, //根据openid登录
  otherregister: `${HOST}/ucenter_my_qqmini_new/myuser/otherregister`, //3.解密用户基础信息，并通过解密出来的unionid判断是否可以登录
  verificationCode: `${HOST}/ucenter_my_qqmini_new/myuser/verificationCode`, //发送手机验证码
  bindingmobile: `${HOST}/ucenter_my_qqmini_new/myuser/bindingmobile`, //5.绑定手机号
  qqGateway: `${HOST}/ucenter_my_qqmini_new/myuser/qqGateway`, //10.qq提现接口
  getuserinviterinfo: `${HOST}/ucenter_my_qqmini/myuser/getuserinviterinfo`, //获取用户邀请人信息
  getbalancedetail: `${HOST}/ucenter_my_qqmini_new/myuser/getbalancedetail`, //8.余额明细接口
  getarrivedorderlist: `${HOST}/ucenter_my_qqmini_new/myuser/getarrivedorderlist`, //9.获取待到账订单列表
  getuserbaseinfo: `${HOST}/ucenter_my_qqmini/myuser/getuserbaseinfo`, //获取用户基础信息
  getuserinviteecnttotal: `${HOST}/ucenter_my_qqmini/myuser/getuserinviteecnttotal`, //获取用户总粉丝数
  getuserinviteelist: `${HOST}/ucenter_my_qqmini/myuser/getuserinviteelist`, //获取用户直属粉丝列表
  getuserinviteelistindirect: `${HOST}/ucenter_my_qqmini/myuser/getuserinviteelistindirect`, //获取用户间接粉丝列表
  getothuserinfo: `${HOST}/ucenter_my_qqmini/myuser/getothuserinfo`, //获取其他用户信息，proc_get_user_incomelist
  getuserincomelist: `${HOST}/ucenter_my_qqmini_new/myuser/getuserincomelist`, //6.获取用户收益面板
  getusercommissionlist: `${HOST}/ucenter_my_qqmini/myuser/getusercommissionlist`, //7.获取用户佣金列表
  getuserwithdrawallist: `${HOST}/ucenter_my_qqmini/myuser/getuserwithdrawallist`, //8.获取用户提现明细列表
  getuserorderlist: `${HOST}/ucenter_my_qqmini_new/myuser/getuserorderlist`, //9.获取用户订单列表
  submitFormid: `${HOST}/ucenter_my_qqmini_new/myuser/submitFormid`, //10.上传formid接口
  banner: `${GOODS_HOST}/api/pinduoduo_service/applets_banner`, // 首页banner
  operationList: `${GOODS_HOST}/api/pinduoduo_service/applets_theme_operation_list`, // 专题列表
  pdd: {
    topGoodsList: `${GOODS_HOST}/api/qq_pdd_service/top_goods_list`, // 实时热榜
    themeOperationGoodsSearch: `${GOODS_HOST}/api/qq_pdd_service/theme_operation_goods_search`, // 0元购商品
    themeListGet: `${GOODS_HOST}/api/qq_pdd_service/theme_list_get`, // 主题列表
    goodsOptGet: `${GOODS_HOST}/api/pinduoduo_service/goods_opt_get`, // 首页商品分类标签
    categaryGet: `${GOODS_HOST}/api/qq_pdd_service/category_get`, // 商品类目下list
    urlGenerate: `${GOODS_HOST}/api/qq_pdd_service/url_generate`, // 商品推广链接
    rpUrlGenerate: `${GOODS_HOST}/api/qq_pdd_service/rp_url_generate`, // 红包推广链接
    goodsDetail: `${GOODS_HOST}/api/qq_pdd_service/goods_detail`, // 商品详情
    goods_detail: `${GOODS_HOST}/api/pinduoduo_service/goods_detail`, // 小程序端根据goodsid获取商品详情 1、页中banner2、瓷片区banner
    goodsRecommendGet: `${GOODS_HOST}/api/qq_pdd_service/goods_recommend_get`, // 运营频道商品详情（详情页-猜你喜欢）
    themeGoodsSearch: `${GOODS_HOST}/api/qq_pdd_service/theme_goods_search`, // 主题商品
    search: `${GOODS_HOST}/api/qq_pdd_service/search`, // 关键词搜索接口
    getGoodsBySubjectId: `${GOODS_HOST}/api/qq_pdd_service/getGoodsBySubjectId`, // 获取SubjectId
    getSubjectInfo: `${GOODS_HOST}/api/qq_pdd_service/getSubjectInfo`, // 获取SubjectId
  },
  log: {
    //日志
    online: `${LOGHOST}/maltdiary_log/online`,
    click: `${LOGHOST}/maltdiary_log/click`,
    active: `${LOGHOST}/maltdiary_log/active`,
    clipboard: `${LOGHOST}/maltdiary_log/clipboard`,
    intoscreen: `${LOGHOST}/maltdiary_log/intoscreen`,
    taskReport_wx: `${TASKCENTER_HOST}/task/taskReport_wx` //app分享淘宝商品落地页增加任务上报
  },
  getdetailbytkl: `${MAIYARIJI_HOST}/MaltDiaryDetail/getdetailbytkl`, //淘宝根据商品ID获取商品详情
  getdetailbyid: `${MAIYARIJI_HOST}/MaltDiaryDetail/getdetailbyid`, //淘宝根据商品ID获取商品详情
  gettkl: `${MAIYARIJI_HOST}/MaltDiaryDetail/getxcxtkl.new`, //获取淘口令
  ewm: `${EWM_HOST}/wxacode/getwxacode`, // 获取二维码
  ewmopt: `${EWM_HOST}/wxacode/getscene`, // 获取sence参数
  jd: {
    promotionPosition: `${GOODS_HOST}/api/qq_jdlm_service/promotion_position`, // 京东京粉精选商品接口
    search: `${GOODS_HOST}/api/qq_jdlm_service/search`, // 京东搜索接口(精选,搜索)
    singleGoodsInfo: `${GOODS_HOST}/api/qq_jdlm_service/single_goodsinfo`, // 京东商品详情接口(无佣金的情况无返回结果)
    promotionLlink: `${GOODS_HOST}/api/qq_jdlm_service/promotion_link` // 京东商品转链接口
  },
  tb: {
    search: `${SOUSUO_HOST}/MaltDiaryV2/search` // 淘宝搜索
  },
  special: `${TKL_HOST}/MaltDiaryDetail/special.g`, //9块9包邮
  specialCate: `${TKL_HOST}/MaltDiaryDetail/special.cate`, //专题
  highsalesvolumerank: `${SXGAPI_HOST}/highsalesvolumerank/list`, //爆款排行榜
  highsalesvolumerank99: `${SXGAPI_HOST}/highsalesvolumerank/list9.9`, //爆款排行榜
  applets_theme_operation_list: `${GOODS_HOST}/api/pinduoduo_service/applets_theme_operation_list`,
  cloudControl: `${GOODS_HOST}/api/qq_jdlm_service/cloud_control`,
  getRank: `${GOODS_HOST}/api/dtk_service/getRank`,//大淘客接口 1.实时榜 2.全天榜 3.热推榜（热推榜分类无效）4.复购榜
  boostingProgress: `${ZL_HOST}/boost/boostingProgress`, //助力红包
  boosting: `${ZL_HOST}/boost/boosting`, //助力
  app_config: {
    queryConfig: `${APP_HOST}/app_config/queryConfig`
  },
  SXGAPI_HOST: {
    gethotlistcategory: `${SXGAPI_HOST}/hotlist/gethotlistcategory`, //获取分类
    getgoodsbycategory: `${SXGAPI_HOST}/hotlist/getgoodsbycategory`, //获取分类
  }
};
export default URL;
