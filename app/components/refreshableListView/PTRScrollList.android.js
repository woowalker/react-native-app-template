/**
 * Created by hebao on 2017/8/28.
 */
'use strict'
import React, {Component, PropTypes} from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Text,
  ScrollView,
  ListView,
  FlatList,
  VirtualizedList
} from 'react-native'

const {width, height} = Dimensions.get('window')
const
  G_STATUS_NONE = 0,// 正常手势，没有上拉或者下拉刷新
  G_STATUS_PULLING_UP = 1,// ListView 处于底部，上拉加载更多
  G_STATUS_PULLING_DOWN = 2,// ListView 处于顶部，下拉刷新
  G_STATUS_RELEASE_TO_REFRESH = 3,// 拉动距离处于可触发刷新或者加载状态
  G_STATUS_HEADER_REFRESHING = 4,// 顶部正在刷新
  G_STATUS_FOOTER_REFRESHING = 5;// 底部正在加载更多

let
  G_PULL_UP_DISTANCE = 50,//上拉加载更多最大上拉距离
  G_PULL_DOWN_DISTANCE = 60,//下拉刷新下拉距离大于 60 时触发下拉刷新
  G_MAX_PULL_DISTANCE = 70;//下拉刷新最大下拉距离

const _onHeaderRefreshing = () => {
  setTimeout(() => {
    RefresherListView.headerRefreshDone();
  }, 2000)
}

const _renderHeaderRefresh = (gestureStatus) => {
  switch (gestureStatus) {
    case G_STATUS_PULLING_DOWN:
      return (
        <View style={{width, height: 60, justifyContent: 'center', alignItems: 'center'}}>
          <Text>{'下拉刷新'}</Text>
        </View>
      )
      break
    case G_STATUS_RELEASE_TO_REFRESH:
      return (
        <View style={{width, height: 60, justifyContent: 'center', alignItems: 'center'}}>
          <Text>{'松开即可刷新'}</Text>
        </View>
      )
      break
    case G_STATUS_HEADER_REFRESHING:
      return (
        <View style={{width, height: 60, justifyContent: 'center', alignItems: 'center'}}>
          <Text>{'正在刷新...'}</Text>
        </View>
      )
      break
    default:
      return (
        <View style={{width, height: 60, justifyContent: 'center', alignItems: 'center'}}>
          <Text>{'下拉刷新'}</Text>
        </View>
      )
  }
}

class HeaderRefresh extends Component {
  static setGestureStatus = (gestureStatus, callback) => null

  static defaultProps = {
    renderHeaderRefresh: () => null
  };

  constructor(props) {
    super(props);
    this.state = {
      gestureStatus: G_STATUS_NONE,
    }
    HeaderRefresh.setGestureStatus = this._setGestureStatus
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.gestureStatus !== this.state.gestureStatus
  }

  _setGestureStatus = (gestureStatus, callback) => {
    if (gestureStatus !== this.state.gestureStatus) {
      this.setState({gestureStatus}, () => callback instanceof Function && callback())
    }
  }

  render() {
    return this.props.renderHeaderRefresh(this.state.gestureStatus)
  }
}

const _onFooterInfiniting = () => {
  setTimeout(() => {
    RefresherListView.footerInfiniteDone()
  }, 2000)
}

const _renderFooterInfinite = (gestureStatus) => {
  switch (gestureStatus) {
    case G_STATUS_PULLING_UP:
      return (
        <View style={{width, height: 60, justifyContent: 'center', alignItems: 'center'}}>
          <Text>{'上拉即可加载更多...'}</Text>
        </View>
      )
      break
    case G_STATUS_RELEASE_TO_REFRESH:
      return (
        <View style={{width, height: 60, justifyContent: 'center', alignItems: 'center'}}>
          <Text>{'松开即可加载更多...'}</Text>
        </View>
      )
      break
    case G_STATUS_FOOTER_REFRESHING:
      return (
        <View style={{width, height: 60, justifyContent: 'center', alignItems: 'center'}}>
          <Text>{'正在加载...'}</Text>
        </View>
      )
      break;
    default:
      return (
        <View style={{width, height: 60, justifyContent: 'center', alignItems: 'center'}}>
          <Text>{'上拉即可加载更多...'}</Text>
        </View>
      )
  }
}

class FooterInfinite extends Component {
  static setGestureStatus = (gestureStatus, callback) => null

  static defaultProps = {
    renderFooterInfinite: () => null
  };

  constructor(props) {
    super(props);
    this.state = {
      gestureStatus: G_STATUS_NONE,
    }
    FooterInfinite.setGestureStatus = this._setGestureStatus
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.gestureStatus !== this.state.gestureStatus
  }

  _setGestureStatus = (gestureStatus, callback) => {
    if (gestureStatus !== this.state.gestureStatus) {
      this.setState({gestureStatus}, () => callback instanceof Function && callback())
    }
  }

  render() {
    return this.props.renderFooterInfinite(this.state.gestureStatus)
  }
}

export default class PTRScrollComponent extends Component {
  resetHeaderHeightHandle = -1

  static headerRefreshDone = () => null
  static footerInfiniteDone = () => null

  static propTypes = {
    scrollComponent: PropTypes.oneOf(['ScrollView', 'ListView', 'FlatList', 'VirtualizedList']).isRequired,

    enableHeaderRefresh: PropTypes.bool,
    renderHeaderRefresh: PropTypes.func,
    onHeaderRefreshing: PropTypes.func,

    enableFooterInfinite: PropTypes.bool,
    renderFooterInfinite: PropTypes.func,
    onFooterInfiniting: PropTypes.func,
  }

  static defaultProps = {
    scrollComponent: 'FlatList',

    enableHeaderRefresh: false,
    renderHeaderRefresh: _renderHeaderRefresh,
    onHeaderRefreshing: _onHeaderRefreshing,

    enableFooterInfinite: false,
    renderFooterInfinite: _renderFooterInfinite,
    onFooterInfiniting: _onFooterInfiniting,
  }

  constructor(props) {
    super(props)
    this.state = {
      //当前手势状态
      gestureStatus: G_STATUS_NONE,
      //当前拖动状态
      onDrag: false,
      //当前是否惯性滚动状态
      onScrollWithoutDrag: false,

      startPageY: 0,
      movePageY: 0,
      isHeaderValid: false
    }
    PTRScrollComponent.headerRefreshDone = this._headerRefreshDone
    PTRScrollComponent.footerInfiniteDone = this._footerInfiniteDone
  }

  componentDidMount() {
    //this._setGestureStatus(G_STATUS_HEADER_REFRESHING, null, true)
  }

  componentWillUnmount() {
    clearTimeout(this.resetHeaderHeightHandle)
  }

  _headerRefreshDone = () => {
    this._setGestureStatus(G_STATUS_NONE, null, false)
    this._scrollView.scrollTo({x: 0, y: G_MAX_PULL_DISTANCE, animated: true})
  }

  _footerInfiniteDone = () => {

  }

  _setGestureStatus = (status, callback, refresh) => {
    this.state.gestureStatus = status
    refresh === true ? HeaderRefresh.setGestureStatus(status, callback) : null
  }

  onScroll = (e) => {
    console.log('xq debug===onScroll')
    let {y} = e.nativeEvent.contentOffset
    let {gestureStatus, onDrag, onScrollWithoutDrag, startPageY, movePageY, isHeaderValid} = this.state
    if (gestureStatus === G_STATUS_NONE) {
      if (onDrag) {
        //开始下拉
        if (!isHeaderValid) {
          if (y <= 1) {
            if (movePageY > startPageY) {
              //下拉
              this.state.isHeaderValid = true
              this._setGestureStatus(G_STATUS_PULLING_DOWN, null, true)

              this._headerRefreshWrap.setNativeProps({style: {height: G_MAX_PULL_DISTANCE}})
              this._scrollView.scrollTo({x: 0, y: G_MAX_PULL_DISTANCE, animated: false})
            }
          }
        }
      }
      else {
        if (onScrollWithoutDrag) {
          //当前状态为正在惯性滚动
        }
        else {
          //scrollTo 设置 animated 为 true 时，不会触发 onMomentumScrollBegin
          if (y === G_MAX_PULL_DISTANCE) {
            //刷新完毕归位
            this._setGestureStatus(G_STATUS_NONE, null, true)
          }
        }
      }
    }
    else if (gestureStatus === G_STATUS_PULLING_DOWN) {
      //下拉刷新
      if (y <= G_MAX_PULL_DISTANCE - G_PULL_DOWN_DISTANCE) {
        this._setGestureStatus(G_STATUS_RELEASE_TO_REFRESH, null, true)
      }
    }
    else if (gestureStatus === G_STATUS_RELEASE_TO_REFRESH) {
      //释放刷新
      if (y > G_MAX_PULL_DISTANCE - G_PULL_DOWN_DISTANCE) {
        this._setGestureStatus(G_STATUS_PULLING_DOWN, null, true)
      }
    }
  }

  onTouchStart = (e) => {
    console.log('onTouchStart')
    this.state.startPageY = e.nativeEvent.pageY
  }

  onTouchMove = (e) => {
    console.log('onTouchMove')
    this.state.movePageY = e.nativeEvent.pageY
  }

  onScrollBeginDrag = (e) => {
    console.log('xq debug===onScrollBeginDrag')
    this.state.onDrag = true

    let {y} = e.nativeEvent.contentOffset
    let {startPageY, movePageY, isHeaderValid, onScrollWithoutDrag} = this.state
    if (!isHeaderValid) {
      if (y === 0) {
        if (movePageY > startPageY) {
          //下拉
          this.state.isHeaderValid = true
          this._setGestureStatus(G_STATUS_PULLING_DOWN, null, true)

          this._headerRefreshWrap.setNativeProps({style: {height: G_MAX_PULL_DISTANCE}})
          this._scrollView.scrollTo({x: 0, y: G_MAX_PULL_DISTANCE, animated: false})
        }
      }
    }
    else {
      if (y === G_MAX_PULL_DISTANCE) {
        if (movePageY > startPageY) {
          //下拉
          this._setGestureStatus(G_STATUS_PULLING_DOWN, null, true)
        }
        else if (movePageY < startPageY) {
          //上滑
          this._setGestureStatus(G_STATUS_NONE, null, true)
        }
      }
      else {
        if (movePageY > startPageY) {
          //下拉
          if (onScrollWithoutDrag) {
            this.state.isHeaderValid = false
            this._headerRefreshWrap.setNativeProps({style: {height: 0}})
            this._scrollView.scrollTo({x: 0, y: y - G_MAX_PULL_DISTANCE, animated: false})
          }
        }
        else if (movePageY < startPageY) {
          //上滑
          this._setGestureStatus(G_STATUS_NONE, null, true)
        }
      }
    }
  }

  onScrollEndDrag = (e) => {
    console.log('xq debug===onScrollEndDrag')
    this.state.onDrag = false

    let {y} = e.nativeEvent.contentOffset
    let {gestureStatus, startPageY, movePageY, isHeaderValid} = this.state
    if (gestureStatus === G_STATUS_PULLING_DOWN) {
      this._setGestureStatus(G_STATUS_NONE, null, false)
      this._scrollView.scrollTo({x: 0, y: G_MAX_PULL_DISTANCE, animated: true})
    }
    else if (gestureStatus === G_STATUS_RELEASE_TO_REFRESH) {
      this._setGestureStatus(G_STATUS_HEADER_REFRESHING, null, true)
      this._scrollView.scrollTo({x: 0, y: G_MAX_PULL_DISTANCE - G_PULL_DOWN_DISTANCE, animated: true})
    }

    if (isHeaderValid) {
      if (movePageY < startPageY) {
        //上滑
        this.resetHeaderHeightHandle = setTimeout(() => {
          console.log('setTimeout exec')
          this.state.isHeaderValid = false
          this._headerRefreshWrap.setNativeProps({style: {height: 0}})
          this._scrollView.scrollTo({x: 0, y: y - G_MAX_PULL_DISTANCE, animated: false})
        }, 100)
      }
    }
  }

  onMomentumScrollBegin = () => {
    //scrollTo 设置 animated 为 true 时，不会触发 onMomentumScrollBegin
    console.log('xq debug===onMomentumScrollBegin')
    this.state.onScrollWithoutDrag = true
    clearTimeout(this.resetHeaderHeightHandle)
  }

  onMomentumScrollEnd = (e) => {
    console.log('xq debug===onMomentumScrollEnd')
    this.state.onScrollWithoutDrag = false

    let {y} = e.nativeEvent.contentOffset
    let {startPageY, movePageY, isHeaderValid} = this.state
    if (isHeaderValid) {
      if (movePageY < startPageY) {
        //上滑
        console.log('onMomentumScrollEnd exec')
        this.state.isHeaderValid = false
        this._headerRefreshWrap.setNativeProps({style: {height: 0}})
        this._scrollView.scrollTo({x: 0, y: y - G_MAX_PULL_DISTANCE, animated: false})
      }
    }
  }

  render() {
    let {scrollComponent, enableHeaderRefresh, enableFooterInfinite} = this.props
    let ScrollComponent = null
    switch (scrollComponent) {
      case 'ScrollView':
        ScrollComponent = <ScrollView {...this.props}/>
        break
      case 'ListView':
        ScrollComponent = <ListView {...this.props}/>
        break
      case 'FlatList':
        ScrollComponent = <FlatList {...this.props}/>
        break
      case 'VirtualizedList':
        ScrollComponent = <VirtualizedList {...this.props}/>
        break
      default:
        ScrollComponent = <FlatList {...this.props}/>
        break
    }
    return (
      <View style={Styles.wrap}>
        <View
          ref={ref => this._headerRefresh = ref}
          onLayout={e => G_PULL_DOWN_DISTANCE = enableHeaderRefresh ? e.nativeEvent.layout.height : height}
          style={[Styles.refresh, {
            transform: [{
              translateY: -height
            }]
          }]}>
          {enableHeaderRefresh ? <HeaderRefresh {...this.props}/> : null}
        </View>
        <View
          ref={ref => this._footerInfinite = ref}
          onLayout={e => G_PULL_UP_DISTANCE = enableFooterInfinite ? e.nativeEvent.layout.height : height}
          style={[Styles.infinite, {
            transform: [{
              translateY: height
            }]
          }]}>
          {enableFooterInfinite ? <FooterInfinite {...this.props}/> : null}
        </View>
        {
          React.cloneElement(ScrollComponent, {
            ref: ref => {
              this._scrollInstance = ref
              this.props.getRef instanceof Function && this.props.getRef(ref)
            },
            scrollEventThrottle: this.props.scrollEventThrottle || 4,
            onTouchStart: this.onTouchStart,
            onTouchMove: this.onTouchMove,
            onScroll: this.onScroll,
            onScrollBeginDrag: this.onScrollBeginDrag,
            onScrollEndDrag: this.onScrollEndDrag,
            onMomentumScrollBegin: this.onMomentumScrollBegin,
            onMomentumScrollEnd: this.onMomentumScrollEnd
          }, this.props.children)
        }
      </View>
    )
  }
}

const Styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden'
  },
  refresh: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  infinite: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  }
});