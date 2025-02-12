import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { TvChartWebSocketAPI } from "./TvChartWebSocketAPI";

const SERVER_URL = 'wss://streamer.cryptocompare.com';
@Injectable()
export class SocketService {
  private socket;
  private _subscriptions=[];
  constructor(public chartSocket: TvChartWebSocketAPI ) { 
    this.socket = socketIo(SERVER_URL);
    this.socket.on('connect', () => {
      console.log('=====Socket connected=======')
    })
    this.socket.on('disconnect', (e) => {
      console.log('=====Socket disconnected:', e +' =======')
    })
    this.socket.on('error', err => {
      console.log('====socket error', err+' =======')
    })
    this.socket.on('m', (e) => {
      // here we get all events the CryptoCompare connection has subscribed to
      // we need to send this new data to our subscribed charts
      const _data= e.split('~')
      if (_data[0] === "3") {
       // console.log('Websocket Snapshot load event complete')
       return
      }
      const data = {
       sub_type: parseInt(_data[0],10),
       exchange: _data[1],
       to_sym: _data[2],
       from_sym: _data[3],
       trade_id: _data[5],
       ts: parseInt(_data[6],10),
       volume: parseFloat(_data[7]),
       price: parseFloat(_data[8])
      }
      
      const channelString = `${data.sub_type}~${data.exchange}~${data.to_sym}~${data.from_sym}`
      
      const sub = this._subscriptions.find(e => e.channelString === channelString)
      
      if (sub) {
       // disregard the initial catchup snapshot of trades for already closed candles
       if (data.ts < sub.lastBar.time / 1000) {
         return
        }
       
     var _lastBar = this.updateBar(data, sub)
     
     // send the most recent bar back to TV's realtimeUpdate callback
       sub.listener(_lastBar)
       // update our own record of lastBar
       sub.lastBar = _lastBar
      }
     })
  }

  public initSocket(): void {
    
    
  }

  // Take a single trade, and subscription record, return updated bar
  //Arnab:: our socket data.price should be updated here to show bars in realtime in ui
updateBar(data, sub) {
  //alert('update bar from socket service ');
  //console.log('from Sikkax socket start');

  var lastBar = sub.lastBar
  let resolution = sub.resolution
  if (resolution.includes('D')) {
   // 1 day in minutes === 1440
   resolution = 1440
  } else if (resolution.includes('W')) {
   // 1 week in minutes === 10080
   resolution = 10080
  }
 var coeff = resolution * 60
  // console.log({coeff})
  var rounded = Math.floor(data.ts / coeff) * coeff
  // var lastBarSec = lastBar.time / 1000
  var _lastBar
//NOTE: Calling paybito websocket data and storing it in _lastBar variable
  let subs = this.chartSocket.currentMessage.subscribe(message => {
    let mes = JSON.parse(message)
    //console.log('from paybito socket',rounded);
    //console.log(mes.t[0])
    // _lastBar = {
    //       time: mes.t[0],
    //       open: mes.o[0],
    //       high: mes.h[0],
    //       low: mes.l[0],
    //       close: mes.c[0],
    //       volume: mes.v[0]
    //      }

    // if (rounded > lastBarSec) {
      // create a new candle, use last close as open **PERSONAL CHOICE**
     
      _lastBar = {
          time: 1660301940000,
          open: parseFloat(mes.o[0]),
          high: parseFloat(mes.h[0]),
          low: parseFloat(mes.l[0]),
          close: parseFloat(mes.c[0]),
          volume: parseFloat(mes.v[0])
         }
      
    //  } 
     //console.log('_lastBar '+JSON.stringify(_lastBar));
     console.log('_lastBar '+_lastBar);
   
     return _lastBar
}) 
  
 
 }
 
 // takes symbolInfo object as input and creates the subscription string to send to CryptoCompare
 createChannelString(symbolInfo) {
   var channel = symbolInfo.name.split(/[:/]/)
   const exchange = channel[0] === 'GDAX' ? 'Coinbase' : channel[0]
   const to = channel[2]
   const from = channel[1]
  // subscribe to the CryptoCompare trade channel for the pair and exchange
   return `0~${exchange}~${from}~${to}`
 }
 channelString:string;
  subscribeBars(symbolInfo, resolution, updateCb, uid, resetCache,history) {
    //alert('SubscribeBars from service');
    this.channelString = this.createChannelString(symbolInfo)
    this.socket.emit('SubAdd', {subs: [this.channelString]})
    let a=this.channelString;
    var newSub = {
      "channelString":a,
    uid,
    resolution,
    symbolInfo,
    lastBar: history[symbolInfo.name].lastBar,
    listener: updateCb,
    }
    //console.log('newSub '+JSON.stringify(newSub));
  this._subscriptions.push(newSub)
  }

  unsubscribeBars(uid) {
    //alert('unsubscribe bar from socket service ');
    var subIndex = this._subscriptions.findIndex(e => e.uid === uid)
    if (subIndex === -1) {
     //console.log("No subscription found for ",uid)
     return
    }
    var sub = this._subscriptions[subIndex]
    this.socket.emit('SubRemove', {subs: [sub.channelString]})
    this._subscriptions.splice(subIndex, 1)
   }
  

}
