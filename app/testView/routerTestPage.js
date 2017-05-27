/**
 * Created by hebao on 2017/5/26.
 */
'use strict';
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import {observable, action, autorun, computed} from 'mobx';
import {observer, Provider, inject} from 'mobx-react/native';
import AppStore from '../stores/testView/testPage';

@inject('store') @observer
class RouterTestPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            change: false
        }
    }

    render() {
        let {wifiName} = this.props.store.state;
        return (
            <View style={Styles.wrap}>
                <Text>{`wifi is: ${wifiName}`}</Text>
                <TouchableOpacity
                    style={Styles.btn}
                    onPress={() => {
                        this.state.change = !this.state.change;
                        this.props.store.state.wifiName = this.state.change ? 'myWifi' : 'walkerXiong';
                    }}>
                    <Text>{'toggle wifi name'}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

export default class RouterPage extends Component {

    static navigationOptions = {
        title: 'Wifi',
    };

    render() {
        return (
            <Provider store={AppStore}>
                <RouterTestPage/>
            </Provider>
        );
    }
};

const Styles = StyleSheet.create({
    wrap: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btn: {
        width: 200,
        height: 50,
        backgroundColor: '#ffe341',
        marginTop: 5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }
});