import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import PropTypes from 'prop-types';
import Card from './card';
import Item from './item';
import './goodsList.scss';

class GoodsList extends Component {
  static defaultProps = {
    goodsList: [],
    itemStyle: 'card'
  };
  render() {
    const { goodsList, itemStyle, union, onClick, style } = this.props;
    const isCard = itemStyle === 'card';
    return (
      <View className={`goods-list ${isCard ? 'goods-card-list' : 'goods-item-list'}`} style={style}>
        {goodsList &&
          goodsList.map(goods => {
            const { id, thumbnail, name, coupon, soldQuantity, newPrice, oldPrice, commission, type, shopType } = goods;
            return isCard ? (
              <View key={id} className='card'>
                <Card
                  thumbnail={thumbnail}
                  name={name}
                  coupon={coupon}
                  soldQuantity={soldQuantity}
                  newPrice={newPrice}
                  oldPrice={oldPrice}
                  commission={commission}
                  shopType={shopType}
                  union={union === 'mix' ? type : union}
                  onClick={() => {
                    if (union === 'mix') {
                      onClick(goods, type);
                    } else {
                      onClick(goods);
                    }
                  }}
                />
              </View>
            ) : (
              <View key={id} className='item'>
                <Item
                  thumbnail={thumbnail}
                  name={name}
                  coupon={coupon}
                  soldQuantity={soldQuantity}
                  newPrice={newPrice}
                  oldPrice={oldPrice}
                  commission={commission}
                  shopType={shopType}
                  union={union === 'mix' ? type : union}
                  onClick={() => {
                    if (union === 'mix') {
                      onClick(goods, type);
                    } else {
                      onClick(goods);
                    }
                  }}
                />
              </View>
            );
          })}
      </View>
    );
  }
}

GoodsList.propTypes = {
  goodsList: PropTypes.arrayOf(
    PropTypes.shape({
      thumbnail: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      coupon: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      soldQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      newPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      oldPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      commission: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
    })
  ).isRequired
};

export default GoodsList;
