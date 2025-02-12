import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { CoreDataService } from "../core-data.service";
import { StopLossComponent } from "../stop-loss/stop-loss.component";
import { TradesComponent } from "../trades/trades.component";
import * as $ from "jquery";
import { DashboardComponent } from "../dashboard/dashboard.component";
import { Action } from "rxjs/internal/scheduler/Action";
import { isNgTemplate } from "@angular/compiler";
import { Subscription } from "rxjs";
import { Title } from '@angular/platform-browser';
import { DerivativeWebSocketAPI } from '../DerivativeWebSocketAPI';
import { C } from "@angular/core/src/render3";
import { OrderBookComponent } from "../order-book/order-book.component"

@Component({
  selector: 'app-derivative-chart',
  templateUrl: './derivative-chart.component.html',
  styleUrls: ['./derivative-chart.component.css']
})
export class DerivativeChartComponent implements OnInit {

  title = 'angulartitle';
  webSocketAPI: DerivativeWebSocketAPI;
  greeting: any;
  name: string;
  req: any;
  reqNo: any;
  reqNo1: any;
  filePath: string;
  fileDir: string;
  url: any = null;
  chartDataInit: any;
  chartData: any;
  selected: any;
  indicatorStatus: any = 0;
  indicatorName: any = "";
  apiUrl: string;
  apiData: any;
  loader: boolean;
  errorText: string;
  selectedBuyingCryptoCurrencyName: string;
  selectedSellingCryptoCurrencyName: string;
  selectedCryptoCurrencySymbol: string;
  selectedBuyingAssetText: string;
  selectedSellingAssetText: string;
  currencyListEur: any = 0;
  currencyListBtc: any = 0;
  currencyListEth: any = 0;
  currencyListUsd: any = 0;
  buyPriceText: any;
  chartD: any = "d";
  dateD: any = "1m";
  indicatorGroup1: any;
  indicatorGroup2: any;
  highValue;
  lowValue;
  cur: any;
  tools: boolean;
  chartlist: any;
  ctpdata: any = 0;
  ltpdata: any = 0;
  lowprice: any = 0;
  highprice: any = 0;
  rocdata: number = 0;
  maxprice: number = 0;
  indexprice: number = 0;
  isMarkPricePositive: boolean;
  isIndexPricePositive: boolean;
  action: any;
  volumndata: any = 0;
  act: any;
  react: boolean;
  buyingAssetIssuer: string;
  sellingAssetIssuer: string;
  //rocact:any;
  rocreact: boolean;
  droc: any;
  negetive: boolean;
  Tonight: boolean;
  Tomorning: boolean;
  filterCurrency: any;
  logic: boolean;
  flag: boolean;
  Cname: any;
  testval = [];
  currency_code: any;
  base_currency: any;
  assetpairbuy: string;
  assetpairsell: string;
  responseBuySell: any;
  header: any;
  assets: any;
  message: any;
  currencyId: any;
  Themecolor: any;
  private currencyapi: Subscription;
  constructor(private titleService: Title,
    public data: CoreDataService,
    public dash: DashboardComponent,
    public websoket: DerivativeWebSocketAPI,
    public http: HttpClient
  ) { }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    if (
      localStorage.getItem('selected_derivative_asset_pair_name') == undefined ||
      localStorage.getItem('selected_derivative_asset_pair_name') == null ||
      localStorage.getItem('selected_derivative_asset_pair_name') == 'undefined' ||
      localStorage.getItem('selected_derivative_asset_pair_name') == 'null' ||
      localStorage.getItem('selected_derivative_asset_pair_name') == '' ||
      localStorage.getItem('selected_derivative_asset_pair') == undefined ||
      localStorage.getItem('selected_derivative_asset_pair') == null ||
      localStorage.getItem('selected_derivative_asset_pair') == 'undefined' ||
      localStorage.getItem('selected_derivative_asset_pair') == 'null' ||
      localStorage.getItem('selected_derivative_asset_pair') == ''
    ) {
      this.base_currency = 'usd';
      localStorage.setItem('selling_asset', this.base_currency);
      localStorage.setItem('selected_derivative_asset_pair', 'BTCUSD_PERP');
    } else {
      this.base_currency = localStorage.getItem('selling_crypto_asset').toLowerCase();
      localStorage.setItem('selling_asset', this.base_currency);
      localStorage.setItem('selected_derivative_asset_pair', localStorage.getItem('selected_derivative_asset_pair'));
    }

    // http://13.52.204.253:7080/SocketStream/api/get24hTicker?counter=btc&base=usd
    //http://18.144.130.37:7080/SocketStream/api/get24hTicker?counter=BTC&base=USD
    this.http.get<any>("https://futures-stream.paybito.com/fSocketStream/api/get24hTicker?assetPair=" + localStorage.getItem("selected_derivative_asset_pair"), {
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'BEARER ' + localStorage.getItem('access_token'),
      }
    }).subscribe(data => {
      var result = data;
      if (this.currency_code == 'BTC' || this.base_currency == 'USDT') {
        this.chartlist = result[0];
        if (this.chartlist) {
          this.ctpdata = this.data.ctpdata = this.chartlist.ctp;
          console.log('#############################################')
          //console.log(this.chartlist.ltp)
          //console.log(this.data.ltpdata)
          this.ltpdata = this.data.ltpdata = this.chartlist.ltp;
          this.lowprice = this.data.lowprice = parseFloat(this.chartlist.lowPrice).toFixed(2);
          this.highprice = this.data.highprice = parseFloat(this.chartlist.highPrice).toFixed(2);
          this.act = this.data.ACTION = this.chartlist.action;
          this.data.rocdata = parseFloat(this.chartlist.roc).toFixed(2);
          this.data.markprice = parseFloat(this.chartlist.markPrice).toFixed(4);
          this.data.indexprice = parseFloat(this.chartlist.indexPrice).toFixed(4);
          if (this.data.markprice > 0) {
            this.data.isMarkPricePositive = true;
          } else {
            this.data.isMarkPricePositive = false;
          }
          if (this.data.indexprice > 0) {
            this.data.isIndexPricePositive = true;
          } else {
            this.data.isIndexPricePositive = false;
          }
          if (this.data.rocdata > 0) {
            this.data.rocreact = true;
          }
          else {
            this.data.rocreact = false;
          }
          if (this.data.rocdata < 0) {
            this.data.negetive = true;
          }
          else {
            this.data.negetive = false;
          }
          this.data.volumndata = parseFloat(this.chartlist.volume).toFixed(2);
          if (this.data.rocdata >= 0) { this.rocreact = true }
          if (this.data.act == 'sell') {
            this.data.react = true;
          }
          else {
            this.data.react = false;
          }
        }
        else {

          this.chartlist = result;
          console.log(this.chartlist)
          if (this.chartlist) {
            //this.ctpdata = this.data.ctpdata = this.chartlist.ctp;
            //console.log(this.data)
            //console.log(this.chartlist.ltp)
            //this.ltpdata = this.data.ltpdata = this.chartlist.ltp;
            this.lowprice = this.data.lowprice = this.chartlist.lowPrice;
            this.highprice = this.data.highprice = this.chartlist.highPrice;
            this.act = this.data.ACTION = this.chartlist.action;
            this.data.rocdata = this.chartlist.tR.roc;
            this.data.markprice = parseFloat(this.chartlist.markPrice).toFixed(4);
            this.data.indexprice = parseFloat(this.chartlist.indexPrice).toFixed(4);
            if (this.data.markprice > 0) {
              this.data.isMarkPricePositive = true;
            } else {
              this.data.isMarkPricePositive = false;
            }
            this.data.volumndata = parseFloat(this.chartlist.volume).toFixed(2);
            if (this.data.rocdata > 0) {
              this.rocreact = true;
            }
            else {
              this.data.rocreact = false;
            }
            if (this.data.rocdata < 0) {
              this.data.negetive = true;
            }
            else {
              this.data.negetive = false;
            }

            if (this.data.rocdata >= 0) { this.rocreact = true }
            if (this.data.act == 'sell') {
              this.data.react = true;
            }
            else {
              this.data.react = false;
            }
          }
        }
      }
      console.log('Data Value .... ')
      console.log(this.data)
      this.setTitle(this.data.ltpdata + ' | ' + 'BTCUSD Perpetual' + ' | ' + this.data.exchange);
      this.Themecolor = localStorage.getItem('themecolor')

    });


    this.websoket._connect();

    if (this.websoket.stompClient != null) {
      setTimeout(() => {
        this.websoket.subscribe();
      }, 8000);
    }

    this.websoket.currentMessage.subscribe((message: any) => {
      if (message) {
        // if(!(typeof message == 'string')){
        this.message = message;
        var result = this.message;
        if (this.currency_code == 'BTC' || this.base_currency == 'USDT') {
          this.chartlist = JSON.parse(result);
          if (this.chartlist.tR) {
            //this.ctpdata = this.data.ctpdata = this.chartlist.tR.ctp;
            //this.ltpdata = this.data.ltpdata = this.chartlist.tR.ltp;
            this.lowprice = this.data.lowprice = parseFloat(this.chartlist.tR.lowPrice).toFixed(2);
            this.highprice = this.data.highprice = parseFloat(this.chartlist.tR.highPrice).toFixed(2);
            this.act = this.data.ACTION = this.chartlist.tR.action;
            this.data.rocdata = parseFloat(this.chartlist.tR.roc).toFixed(2);
            this.data.markprice = parseFloat(this.chartlist.tR.markPrice).toFixed(4);
            this.data.indexprice = parseFloat(this.chartlist.tR.indexPrice).toFixed(4);
            if (this.data.markprice > 0) {
              this.data.isMarkPricePositive = true;
            } else {
              this.data.isMarkPricePositive = false;
            }
            if (this.data.rocdata > 0) {
              this.data.rocreact = true;
            }
            else {
              this.data.rocreact = false;
            }
            if (this.data.rocdata < 0) {
              this.data.negetive = true;
            }
            else {
              this.data.negetive = false;
            }
            this.data.volumndata = parseFloat(this.chartlist.tR.volume).toFixed(2);
            if (this.data.rocdata >= 0) { this.rocreact = true }
            if (this.data.act == 'sell') {
              this.data.react = true;
            }
            else {
              this.data.react = false;
            }
          }
          else {

            this.chartlist = result;
            if (this.chartlist.tR) {
              //this.ctpdata = this.data.ctpdata = this.chartlist.tR.ctp;
              //this.ltpdata = this.data.ltpdata = this.chartlist.tR.ltp;
              this.lowprice = this.data.lowprice = this.chartlist.tR.lowPrice;
              this.highprice = this.data.highprice = this.chartlist.tR.highPrice;
              this.act = this.data.ACTION = this.chartlist.tR.action;
              this.data.rocdata = this.chartlist.tR.roc;
              this.data.markprice = parseFloat(this.chartlist.tR.markPrice).toFixed(4);
              this.data.indexprice = parseFloat(this.chartlist.tR.indexPrice).toFixed(4);
              if (this.data.markprice > 0) {
                this.data.isMarkPricePositive = true;
              } else {
                this.data.isMarkPricePositive = false;
              }
              this.data.volumndata = parseFloat(this.chartlist.tR.volume).toFixed(2);
              if (this.data.rocdata > 0) {
                this.rocreact = true;
              }
              else {
                this.data.rocreact = false;
              }
              if (this.data.rocdata < 0) {
                this.data.negetive = true;
              }
              else {
                this.data.negetive = false;
              }

              if (this.data.rocdata >= 0) { this.rocreact = true }
              if (this.data.act == 'sell') {
                this.data.react = true;
              }
              else {
                this.data.react = false;
              }
            }
          }
        }
      }

      this.setTitle(this.data.ltpdata + ' | ' + 'BTCUSD Perpetual' + ' | ' + this.data.exchange);
      this.Themecolor = localStorage.getItem('themecolor')

    });

    if (
      localStorage.getItem('selected_derivative_asset_pair_name') == undefined ||
      localStorage.getItem('selected_derivative_asset_pair_name') == null ||
      localStorage.getItem('selected_derivative_asset_pair_name') == 'undefined' ||
      localStorage.getItem('selected_derivative_asset_pair_name') == 'null' ||
      localStorage.getItem('selected_derivative_asset_pair_name') == '' ||
      localStorage.getItem('selected_derivative_asset_pair') == undefined ||
      localStorage.getItem('selected_derivative_asset_pair') == null ||
      localStorage.getItem('selected_derivative_asset_pair') == 'undefined' ||
      localStorage.getItem('selected_derivative_asset_pair') == 'null' ||
      localStorage.getItem('selected_derivative_asset_pair') == ''
    ) {
      this.currency_code = 'BTC';
      this.base_currency = 'USD';
      localStorage.setItem("buying_crypto_asset", this.currency_code.toUpperCase());
      localStorage.setItem("selling_crypto_asset", this.base_currency.toUpperCase());
      localStorage.setItem("selected_derivative_asset_pair", 'BTCUSD_PERP');
      localStorage.setItem("selected_derivative_asset_pair_name", 'BTCUSD Perpetual');
    } else {
      localStorage.setItem("selected_derivative_asset_pair", localStorage.getItem('selected_derivative_asset_pair'));
      localStorage.setItem("selected_derivative_asset_pair_name", localStorage.getItem('selected_derivative_asset_pair_name'));
      let derivativeAssets = JSON.parse(localStorage.getItem('derivative_assets')).Values;
      console.log(derivativeAssets)
      for(let i=0;i<derivativeAssets.length;i++){
        console.log(localStorage.getItem('selected_derivative_asset_pair'),derivativeAssets[i].assetPair)
        if(localStorage.getItem('selected_derivative_asset_pair') == derivativeAssets[i].assetPair){
          this.currency_code = derivativeAssets[i].currencyCode;
          this.base_currency = derivativeAssets[i].baseCurrency;
          localStorage.setItem("buying_crypto_asset", this.currency_code.toUpperCase());
          localStorage.setItem("selling_crypto_asset", this.base_currency.toUpperCase());
          break;
        }
      }
    }
    console.log(' --------- in derivative chart compoenet ------------');
    
    console.log(this.base_currency,this.currency_code)
    this.data.selectedSellingAssetText = this.base_currency;
    this.data.selectedBuyingAssetText = this.currency_code;


  }

  //   abcmethod(message:any){
  //     if (message != undefined) {
  //      var result = message;
  //       if (this.currency_code == 'BTC' || this.base_currency == 'USDT') {
  //         this.chartlist = JSON.parse(result);
  //         this.ctpdata = this.data.ctpdata = this.chartlist.tR.ctp;
  //         console.log(this.ctpdata);
  //         this.ltpdata = this.data.ltpdata = this.chartlist.tR.ltp;
  //         this.lowprice = this.data.lowprice = parseFloat(this.chartlist.tR.lowPrice).toFixed(2);
  //         this.highprice = this.data.highprice = parseFloat(this.chartlist.tR.highPrice).toFixed(2);
  //         this.act = this.data.ACTION = this.chartlist.tR.action;
  //         this.data.rocdata = parseFloat(this.chartlist.tR.roc).toFixed(2);
  //         if (this.data.rocdata > 0) {
  //           this.data.rocreact = true;
  //         }
  //         else {
  //           this.data.rocreact = false;
  //         }
  //         if (this.data.rocdata < 0) {
  //           this.data.negetive = true;
  //         }
  //         else {
  //           this.data.negetive = false;
  //         }
  //         this.data.volumndata = parseFloat(this.chartlist.tR.volume).toFixed(2);
  //         if (this.data.rocdata >= 0) { this.rocreact = true }
  //         if (this.data.act == 'sell') {
  //           this.data.react = true;
  //         }
  //         else {
  //           this.data.react = false;
  //         }
  //       }
  //       else {

  //         this.chartlist = JSON.parse(result);
  //         if(this.chartlist.tR!=null){
  //         this.ctpdata = this.data.ctpdata = this.chartlist.tR.ctp;
  //         console.log(this.ctpdata,'hiii');
  //         this.ltpdata = this.data.ltpdata = this.chartlist.tR.ltp;
  //         this.lowprice = this.data.lowprice = this.chartlist.tR.lowPrice;
  //         this.highprice = this.data.highprice = this.chartlist.tR.highPrice;
  //         this.act = this.data.ACTION = this.chartlist.tR.action;
  //         this.data.rocdata = this.chartlist.tR.roc;
  //         this.data.volumndata = parseFloat(this.chartlist.tR.volume).toFixed(2);
  //         if (this.data.rocdata > 0) {
  //           this.rocreact = true;
  //         }
  //         else {
  //           this.data.rocreact = false;
  //         }
  //         if (this.data.rocdata < 0) {
  //           this.data.negetive = true;
  //         }
  //         else {
  //           this.data.negetive = false;
  //         }

  //         if (this.data.rocdata >= 0) { this.rocreact = true }
  //         if (this.data.act == 'sell') {
  //           this.data.react = true;
  //         }
  //         else {
  //           this.data.react = false;
  //         }
  //         }
  //     }
  //   }

  // else {
  //   this.ctpdata = this.data.ctpdata = '0';
  //   this.ltpdata = this.data.ltpdata = '0';
  //   this.lowprice = this.data.lowprice = '0';
  //   this.highprice = this.data.highprice = '0';
  //   this.rocdata = this.data.ACTION = 0;
  //   this.volumndata = this.data.volumndata = 0;
  // }
  // this.setTitle(this.data.ltpdata + ' | ' + 'BTCUSD' + ' | ' + 'Paybito');

  // }

  changemode() {
    if (this.data.changescreencolor == true) {
      $(".bg_new_class")
        .removeClass("bg-dark")
        .css("background-color", "#fefefe");
      $(".btn")
        .removeClass("bg-black")
        .css("background-color", "#dedede");
      $(".btn").css("border-color", "#b3b4b4");
      $(".btn").css("color", "#000");
      $(".charts-tab.active").css("background-color", "#fefefe");
    } else {
      $(".bg_new_class")
        .removeClass("bg-dark")
        .css("background-color", "#16181a");
      $(".btn")
        .removeClass("bg-black")
        .css("background-color", "rgb(44, 65, 66)");
      $(".btn").css("border-color", "transparent");
      $(".btn").css("color", "#fff");
      $(".charts-tab.active").css("background-color", "#242e3e");
    }
  }



  ngDoCheck() {
    this.changemode();
    this.Themecolor = localStorage.getItem('themecolor')
 }


  disconnect() {
    this.websoket._disconnect();
  }

  subscribe() {
    this.reqNo = Math.floor((Math.random() * 1000) + 1);
    const req = {
      "method": "SUBSCRIBE",
      "params": [
        "btc/usd@ticker"
      ],
      "id": this.reqNo
    };

    this.websoket._send(req);
  }

  unsubscribe() {
    const req = {
      "method": "UNSUBSCRIBE",
      "params": [
        "btc/usd@ticker"
      ],
      "id": this.reqNo
    };

    this.websoket._send(req);
  }

  subscribe1() {
    this.reqNo = Math.floor((Math.random() * 1000) + 1);
    const req = {
      "method": "SUBSCRIBE",
      "params": [
        "btc/usdt@ticker"
      ],
      "id": this.reqNo
    };

    this.webSocketAPI._send(req);
  }

  unsubscribe1() {
    const req = {
      "method": "UNSUBSCRIBE",
      "params": [
        "btc/usdt@ticker"
      ],
      "id": this.reqNo
    };

    this.webSocketAPI._send(req);
  }

  handleMessage(message) {
    this.greeting = message;
  }

  show() {
    var json = {
      "marketDataList": [
        { "messageType": "X", "symbol": "BTC/USD", "sendingTime": "20200727-06:38:57.062", "mdReqId": "3131", "mdEntryPrice": "10028.5", "mdEntryQuantity": "", "mdEntryType": "0", "mdUpdateAction": "0" },
        { "messageType": "X", "symbol": "BTC/USD", "sendingTime": "20200727-06:38:57.062", "mdReqId": "3131", "mdEntryPrice": "10441.6", "mdEntryQuantity": "2.103", "mdEntryType": "1", "mdUpdateAction": "1" },
        { "messageType": "X", "symbol": "BTC/USD", "sendingTime": "20200727-06:38:57.062", "mdReqId": "3131", "mdEntryPrice": "10451.3", "mdEntryQuantity": "", "mdEntryType": "1", "mdUpdateAction": "2" },
        { "messageType": "X", "symbol": "BTC/USD", "sendingTime": "20200727-06:38:57.062", "mdReqId": "3131", "mdEntryPrice": "10495.7", "mdEntryQuantity": "0.1234", "mdEntryType": "1", "mdUpdateAction": "0" },
        { "messageType": "X", "symbol": "BTC/USD", "sendingTime": "20200727-06:38:57.062", "mdReqId": "3131", "mdEntryPrice": "10510.6", "mdEntryQuantity": "0.9832", "mdEntryType": "1", "mdUpdateAction": "0" },
        { "messageType": "X", "symbol": "BTC/USD", "sendingTime": "20200727-06:38:57.062", "mdReqId": "3131", "mdEntryPrice": "10522.3", "mdEntryQuantity": "1.2492", "mdEntryType": "1", "mdUpdateAction": "0" },
        { "messageType": "X", "symbol": "BTC/USD", "sendingTime": "20200727-06:38:57.062", "mdReqId": "3131", "mdEntryPrice": "10524.5", "mdEntryQuantity": "14.654", "mdEntryType": "1", "mdUpdateAction": "0" }]
    };

    var js1 = json.marketDataList[0];
    // console.log("message "+ json.marketDataList[0].mdEntryPrice);
    // console.log("message "+ js1.mdEntryPrice);
  }
     /* method defination for calling get 24 hr ticker manually */
     handle24hrTickerManualy = () => {
      this.http.get<any>("https://futures-stream.paybito.com/fSocketStream/api/get24hTicker?assetPair=" + localStorage.getItem("selected_derivative_asset_pair"), {
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'BEARER ' + localStorage.getItem('access_token'),
        }
      }).subscribe(data => {
        var result = data;
        if (this.currency_code == 'BTC' || this.base_currency == 'USDT') {
          this.chartlist = result[0];
          if (this.chartlist) {
            this.ctpdata = this.data.ctpdata = this.chartlist.ctp;
            //console.log('#############################################')
            //console.log(this.chartlist.ltp)
            //console.log(this.data.ltpdata)
            //this.ltpdata = this.data.ltpdata = this.chartlist.ltp;
            this.lowprice = this.data.lowprice = parseFloat(this.chartlist.lowPrice).toFixed(2);
            this.highprice = this.data.highprice = parseFloat(this.chartlist.highPrice).toFixed(2);
            this.act = this.data.ACTION = this.chartlist.action;
            this.data.rocdata = parseFloat(this.chartlist.roc).toFixed(2);
            this.data.markprice = parseFloat(this.chartlist.markPrice).toFixed(4);
            this.data.indexprice = parseFloat(this.chartlist.indexPrice).toFixed(4);
            if (this.data.markprice > 0) {
              this.data.isMarkPricePositive = true;
            } else {
              this.data.isMarkPricePositive = false;
            }
            if (this.data.indexprice > 0) {
              this.data.isIndexPricePositive = true;
            } else {
              this.data.isIndexPricePositive = false;
            }
            if (this.data.rocdata > 0) {
              this.data.rocreact = true;
            }
            else {
              this.data.rocreact = false;
            }
            if (this.data.rocdata < 0) {
              this.data.negetive = true;
            }
            else {
              this.data.negetive = false;
            }
            this.data.volumndata = parseFloat(this.chartlist.volume).toFixed(2);
            if (this.data.rocdata >= 0) { this.rocreact = true }
            if (this.data.act == 'sell') {
              this.data.react = true;
            }
            else {
              this.data.react = false;
            }
          }
          else {
  
            this.chartlist = result;
            console.log(this.chartlist)
            if (this.chartlist) {
              //this.ctpdata = this.data.ctpdata = this.chartlist.ctp;
              //console.log(this.data)
              //console.log(this.chartlist.ltp)
              //this.ltpdata = this.data.ltpdata = this.chartlist.ltp;
              this.lowprice = this.data.lowprice = this.chartlist.lowPrice;
              this.highprice = this.data.highprice = this.chartlist.highPrice;
              this.act = this.data.ACTION = this.chartlist.action;
              this.data.rocdata = this.chartlist.tR.roc;
              this.data.markprice = parseFloat(this.chartlist.markPrice).toFixed(4);
              this.data.indexprice = parseFloat(this.chartlist.indexPrice).toFixed(4);
              if (this.data.markprice > 0) {
                this.data.isMarkPricePositive = true;
              } else {
                this.data.isMarkPricePositive = false;
              }
              this.data.volumndata = parseFloat(this.chartlist.volume).toFixed(2);
              if (this.data.rocdata > 0) {
                this.rocreact = true;
              }
              else {
                this.data.rocreact = false;
              }
              if (this.data.rocdata < 0) {
                this.data.negetive = true;
              }
              else {
                this.data.negetive = false;
              }
  
              if (this.data.rocdata >= 0) { this.rocreact = true }
              if (this.data.act == 'sell') {
                this.data.react = true;
              }
              else {
                this.data.react = false;
              }
            }
          }
        }
        console.log('Data Value .... ')
        console.log(this.data)
        this.setTitle(this.data.ltpdata + ' | ' + 'BTCUSD Perpetual' + ' | ' + this.data.exchange);
  
      });
     }


  ngOnDestroy() {
    if (this.data.source3 != undefined) {
      this.data.source3.close();
    }
    if (this.currencyapi != undefined) {
      this.currencyapi.unsubscribe();
    }
    if (this.websoket.stompClient != null) {
      this.websoket.unsubscribe();
    }
  }
}



