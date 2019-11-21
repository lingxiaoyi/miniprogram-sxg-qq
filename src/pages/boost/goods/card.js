import Taro, { Component } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import PropTypes from 'prop-types';

import './card.scss';

class Card extends Component {
  static defaultProps = {};

  render() {
    const {
      thumbnail,
      name,
      coupon,
      soldQuantity,
      newPrice,
      oldPrice,
      commission,
      onClick,
      union,
      shopType
    } = this.props;
    return (
      <View className='goods-card' onClick={onClick}>
        <View className='img-wrap'>
          <Image className='img' src={thumbnail} lazyLoad />
        </View>
        <View className='txt-wrap'>
          <Text className='title'>
            <Text className={`union ${union === 'tb' ? shopType : union}`} />
            {name}
          </Text>
          <View className='info money'>
            <Text className='commission'>可领红包￥{commission}</Text>
            {coupon ? <Text className='coupon'>{coupon}元券</Text> : <Text />}
          </View>
          <View className='info money'>
            <View className='price'>
              <Text className='new'>￥{newPrice}</Text>
              {coupon && <Text className='old'>￥{oldPrice}</Text>}
            </View>
            <Text className='sold'>已售{soldQuantity}</Text>
          </View>
        </View>
      </View>
    );
  }
}

Card.propTypes = {
  thumbnail: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  coupon: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  soldQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  newPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  oldPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  commission: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  union: PropTypes.oneOf(['tb', 'jd', 'pdd']),
  shopType: PropTypes.oneOf(['tb', 'tm'])
};

export default Card;
