import Taro, { Component, useState } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Button, Image, Ad } from '@tarojs/components';

function Counter({initialCount}) {
  const [count, setCount] = useState(initialCount);
  return (
    <View>
      Count: {count}
      <Button onClick={() => setCount(initialCount)}>Reset</Button>
      <Button onClick={() => setCount(prevCount => prevCount + 1)}>+</Button>
      <Button onClick={() => setCount(prevCount => prevCount - 1)}>-</Button>
      <Button onClick={() => setCount(1111)}>test</Button>
    </View>
  );
}
export default Counter
