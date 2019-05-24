import React, { Component } from 'react';
import liffHelper from '../utils/liffHelper';
import rp from 'request-promise';
import qs from 'query-string';

export default class Thankyou extends Component {
    async componentDidMount() {
        try {
            const { transactionId } = qs.parse(window.location.search);
            console.log('transactionId', transactionId);
            this.confirmPaymentRequest(transactionId);
        } catch (err) {
            console.log(err);
        }
    }

    confirmPaymentRequest(transactionId) {
        return new Promise((resolve, reject) => {
            return rp({
                method: 'GET',
                uri: `https://us-central1-sitthi-linepay-demo.cloudfunctions.net/confirmPaymentClient?transactionId=${transactionId}`,
                json: true,
            }).then((response) => {
                console.log('response', response);
            }).catch(function (err) {
                console.log('err', err);
                reject(err);
            });
        });
    }

    render() {
        return (
            <div className="page-content">
                <div className="col-lg-3" />
                <div className="col-lg-6">
                    <div>
                        <img src="./images/check.png" width="30%" alt="checked" />
                        <h4>ได้รับชำระเงินเรียบร้อยแล้ว</h4>
                        <h4>ขอบคุณค่ะ</h4>
                    </div>
                    <hr />
                    <button type="button" className="btn btn-default" onClick={() => { liffHelper.closeWindow() }}>Close</button>
                </div>
                <div className="col-lg-3" />
            </div>
        );
    }
}