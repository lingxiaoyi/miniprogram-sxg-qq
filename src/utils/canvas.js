import Taro from '@tarojs/taro';
import QRCode from 'weapp-qrcode';
// import { getGlobalData } from '../utils/wx';
import { getEwm } from './api';
// import posterPath from '../asset/share/poster_3x.jpg';

/* eslint-disable */
const defaultAvatarUrl = 'https://h5.suixingou.com/miniprogram-assets/sxgqq/mine/default-avatar.png';
const defaultPoster = 'https://h5.suixingou.com/miniprogram-assets/sxgqq/share/poster_invite.jpg';
/* eslint-enable */

/**
 * 将指定字符串按照一行显示指定字数切割成一个数组，并计算出行数（默认一行9个字）
 */
function optionStr(str, lineNum = 18) {
  let i = 0;
  let line = 1;
  let optstr = '';
  let list = [];
  for (let item of str) {
    if (list.length === 0) {
      lineNum = 18;
    } else {
      lineNum = 20;
    }
    if (item === '\n') {
      list.push(optstr);
      list.push('a');
      i = 0;
      optstr = '';
      line += 1;
    } else if (i === lineNum) {
      list.push(optstr);
      i = 1;
      optstr = item;
      line += 1;
    } else {
      optstr += item;
      i += 1;
    }
  }
  if (list.length >= 2) {
    list[1] += '...';
  }
  list.push(optstr);
  return {
    line: line,
    list: list
  };
}

/**
 * px转rpx
 */
function rpx(px) {
  // const { windowWidth } = getGlobalData('system_info');
  // return (px * windowWidth) / 750; // 750设计稿宽度
  return px;
}
function drawText({ ctx = {}, fontsize = 13, color = '#999', text = '', sx = 28, sy = 1005 }) {
  ctx.font = `normal normal ${fontsize}px PingFang-SC`;
  let metrics = ctx.measureText(`${text}`);
  ctx.setFontSize(fontsize);
  ctx.setFillStyle(color);
  ctx.fillText(`${text}`, sx, sy);
  return metrics.width;
}
async function drawImg({
  ctx = {},
  src = '', //默认图片
  dx = 0, //
  dy = 0,
  // dWidth = 800,
  // dHeight = 800,
  sx = 0,
  sy = 0,
  sWidth = 750,
  sHeight = 750
}) {
  const { path: gdsPosterPath, width } = await Taro.getImageInfo({ src });
  ctx.drawImage(gdsPosterPath, dx, dy, width, width, sx, sy, sWidth, sHeight);
  ctx.restore();
  ctx.save();
  return width;
}
/**
 *
 * @param {CanvasContext} ctx canvas上下文
 * @param {number} x 圆角矩形选区的左上角 x坐标
 * @param {number} y 圆角矩形选区的左上角 y坐标
 * @param {number} w 圆角矩形选区的宽度
 * @param {number} h 圆角矩形选区的高度
 * @param {number} r 圆角的半径
 */
// function roundRect(x, y, w, h, r, ctx) {
//   // 开始绘制
//   ctx.beginPath();
//   // 因为边缘描边存在锯齿，最好指定使用 transparent 填充
//   // 这里是使用 fill 还是 stroke都可以，二选一即可
//   ctx.setFillStyle('transparent');
//   // ctx.setStrokeStyle('transparent')
//   // 左上角
//   ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);

//   // border-top
//   ctx.moveTo(x + r, y);
//   ctx.lineTo(x + w - r, y);
//   ctx.lineTo(x + w, y + r);
//   // 右上角
//   ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);

//   // border-right
//   ctx.lineTo(x + w, y + h - r);
//   ctx.lineTo(x + w - r, y + h);
//   // 右下角
//   ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);

//   // border-bottom
//   ctx.lineTo(x + r, y + h);
//   ctx.lineTo(x, y + h - r);
//   // 左下角
//   ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);

//   // border-left
//   ctx.lineTo(x, y + r);
//   ctx.lineTo(x + r, y);

//   // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
//   ctx.fill();
//   // ctx.stroke()
//   ctx.closePath();
//   // 剪切
//   //ctx.clip();
// }
function drawRect({ ctx = {}, sx = 28, sy = 0, sWidth = 750, sHeight = 750, bgColor = '#fff' }) {
  ctx.fillStyle = bgColor;
  ctx.fillRect(sx, sy, sWidth, sHeight);
  //roundRect(sx, sy, sWidth, sHeight, 28, ctx);
  return sWidth;
}
function drawLine({ ctx = {}, sx = 28, sy = 0, ex = 750, ey = 750, bgColor = '#999' }) {
  ctx.setStrokeStyle(bgColor);
  ctx.setLineWidth(2);
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
}
export async function generateDetailsPoster({
  ctx = {}, // canvas上下文对象
  name = '商品名称标题', // 商品名称标题
  newPrice = 0, // 券后价
  oldPrice = 0, // 原价
  coupon = 0, // 优惠券金额
  soldQuantity = 0, // 销售数量
  //commission = 0, // 佣金
  pagePath = 'pages/details/pdd/pdd',
  poster = defaultPoster, // 'https://h5.suixingou.com/miniprogram-assets/sxgqq//share/poster_invite.jpg', // 海报
  avatarUrl = defaultAvatarUrl, // 默认头像
  nickName = '您的好友', // 昵称
  // scene,
  scope,
  shareShortUrl
}) {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 750, 1123.5);
  let prevWidth = 0; //上一个元素的宽度
  //1.画默认大banner图片 海报
  //await drawImg({ ctx, src: replaceHttp(poster) });
  //2.标题2行加商家标志 京东平多多
  if (pagePath.indexOf('pdd') === -1) {
    prevWidth = drawRect({ ctx, sx: 28, sy: 778, sWidth: 72, sHeight: 38, bgColor: '#FF252C' });
    drawText({ ctx, fontsize: 28, color: '#fff', text: '京东', sx: 36, sy: 778 + 28 });
  } else {
    prevWidth = drawRect({ ctx, sx: 28, sy: 778, sWidth: 100, sHeight: 38, bgColor: '#FF252C' });
    drawText({ ctx, fontsize: 28, color: '#fff', text: '拼多多', sx: 36, sy: 778 + 28 });
  }

  let { line, list } = optionStr(name);
  for (let i = 0; i < line; i++) {
    if (i === 0) {
      drawText({ ctx, fontsize: 32, color: '#333', text: list[i], sx: prevWidth + 28 + 10, sy: 781 + 26 });
    } else if (i === 1) {
      drawText({ ctx, fontsize: 32, color: '#333', text: list[i], sy: 824 + 32 });
    }
  }
  // 3.券后价和已售数量
  prevWidth = drawText({ ctx, fontsize: 28, color: '#FF252C', text: `${coupon ? '券后价¥' : '价格'}`, sy: 884.5 + 28 });
  drawText({ ctx, fontsize: 45, color: '#FF252C', text: newPrice, sx: prevWidth + 28 + 20.5, sy: 872 + 45 }); //价格
  drawText({ ctx, fontsize: 20, color: '#999', text: `已售${soldQuantity}`, sx: 625.5, sy: 879.5 + 25 });
  //4.原价优惠券
  if (coupon) {
    prevWidth = drawText({ ctx, fontsize: 28, color: '#999', text: `原价¥`, sy: 933 + 28 });
    let prevWidth2 = drawText({
      ctx,
      fontsize: 28,
      color: '#999',
      text: `${oldPrice}`,
      sx: prevWidth + 28,
      sy: 933 + 28
    });
    drawLine({ ctx, sx: prevWidth + 28, sy: 933 + 19, ex: prevWidth + 28 + prevWidth2, ey: 933 + 19 });
    drawText({
      ctx,
      fontsize: 28,
      color: '#FF252C',
      text: `优惠券¥${coupon}`,
      sx: prevWidth2 + prevWidth + 28 + 16,
      sy: 933 + 28
    });
  }
  // 5.头像
  avatarUrl = replaceHttp(avatarUrl);
  // 非配置域名，使用默认头像
  if (!isContain(avatarUrl)) {
    avatarUrl = defaultAvatarUrl;
  }
  //await drawImg({ ctx, src: avatarUrl, sx: 28, sy: 1005, sWidth: 75, sHeight: 75 });
  ctx.save();
  ctx.beginPath();
  let x = 28 + 37.5;
  let y = 1005 + 37.5;
  let r = 37.5;
  ctx.arc(rpx(x), rpx(y), rpx(r), 0, 2 * Math.PI, true);
  ctx.clip();
  ctx.restore();
  // 头像旁边名字  文字到画板上边距取的是文字底边到距离
  drawText({ ctx, fontsize: 28, color: '#333', text: nickName, sx: 115.5, sy: 1013 + 28 });
  // 头像旁边介绍
  drawText({ ctx, fontsize: 20, color: '#999', text: `邀请您享受京东/拼多多内购优惠`, sx: 115.5, sy: 1047 + 28 });

  QRCode({
    width: 250,
    height: 250,
    canvasId: 'canvas_show2',
    text: shareShortUrl
  });
  let tempFilePath = await Taro.canvasToTempFilePath(
    {
      canvasId: 'canvas_show2',
      fileType: 'jpg',
      quality: 0.8,
      destWidth: 250,
      destHeight: 250
    },
    scope
  );
  await drawImg({
    ctx,
    src: tempFilePath.tempFilePath,
    dWidth: 280,
    dHeight: 280,
    sx: 584,
    sy: 945.5,
    sWidth: 125,
    sHeight: 125
  });
  drawText({ ctx, fontsize: 20, color: '#999', text: `长按识别`, sx: 605.5, sy: 1075.5 + 20 });
  await drawImg({ ctx, src: replaceHttp(poster) });
  await drawImg({ ctx, src: avatarUrl, sx: 28, sy: 1005, sWidth: 75, sHeight: 75 });
  return new Promise(resolve => {
    ctx.draw(true, resolve);
  });
}

export async function generateInvitePoster({
  ctx = {},
  avatarUrl = defaultAvatarUrl, // 默认头像
  nickName = '您的好友', // 昵称
  scene
}) {
  const canvasWidth = 720;
  const canvasHeight = 1300;

  ctx.setFillStyle('white');
  ctx.fillRect(0, 0, rpx(canvasWidth), rpx(canvasHeight));

  // 海报
  const { path: posterPath } = await Taro.getImageInfo({
    src: 'https://h5.suixingou.com/miniprogram-assets/sxgqq/share/poster_3x.jpg'
  });
  ctx.drawImage(posterPath, 0, 0, 720, 1300, 0, 0, rpx(canvasWidth), rpx(canvasHeight));

  // 昵称
  ctx.font = `normal normal ${rpx(27)}px PingFang-SC`;
  ctx.setFontSize(rpx(27));
  ctx.setFillStyle('#ffffff');
  const nickNameWidth = ctx.measureText(nickName).width;
  // console.log(nickNameWidth);
  ctx.fillText(`${nickName}`, rpx(canvasWidth / 2 - nickNameWidth / 2), rpx(200));

  // 头像
  let avatarSize = 132; // 头像实际尺寸（微信头像尺寸）
  const avatarWidth = 126; // 头像展示尺寸
  const r = avatarWidth / 2; // 半径
  const x = canvasWidth / 2; // 圆心x坐标
  const y = 45 + r; // 圆心y坐标
  avatarUrl = replaceHttp(avatarUrl);
  // 非配置域名，使用默认头像
  if (!isContain(avatarUrl)) {
    avatarUrl = defaultAvatarUrl;
  }
  const { path: avatarPath, width } = await Taro.getImageInfo({ src: avatarUrl });
  avatarSize = width;
  ctx.save();
  ctx.beginPath();
  ctx.arc(rpx(x), rpx(y), rpx(r), 0, 2 * Math.PI, true);
  ctx.clip();
  ctx.drawImage(
    avatarPath,
    0,
    0,
    avatarSize,
    avatarSize,
    rpx(canvasWidth / 2 - r),
    rpx(y - r),
    rpx(avatarWidth),
    rpx(avatarWidth)
  );
  ctx.restore();

  // 广告语
  // const { path: adlPath } = await Taro.getImageInfo({
  //   src: 'https://h5.suixingou.com/miniprogram-assets/sxgqq/share/adl.png'
  // });
  // ctx.drawImage(adlPath, 0, 0, 290, 103, rpx(16), rpx(741), rpx(290), rpx(103));
  // 小程序码
  const ewmWidth = 280;
  const { path: ewmPath } = await Taro.getImageInfo({
    src: getEwm({
      is_hyaline: true,
      width: ewmWidth,
      page: 'pages/login/login',
      scene
    })
  });
  ctx.drawImage(ewmPath, 0, 0, ewmWidth, ewmWidth, rpx(52), rpx(1116), rpx(150), rpx(150));

  return new Promise(resolve => {
    ctx.draw(true, resolve);
  });
}

function replaceHttp(url) {
  return url.replace('http:', 'https:');
}

function isContain(avatarUrl) {
  return [
    'https://thirdwx.qlogo.cn',
    'https://wx.qlogo.cn',
    'https://thirdqq.qlogo.cn',
    'https://figure.suixingou.com'
  ].some(u => avatarUrl.indexOf(u) !== -1);
}
