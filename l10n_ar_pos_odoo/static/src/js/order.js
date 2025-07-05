"use strict";
odoo.define('l10n_ar_pos_odoo.order', function (require) {

    var models = require('point_of_sale.models');
    var core = require('web.core');
    var utils = require('web.utils');

    var round_pr = utils.round_precision;
    var qweb = core.qweb;
    var _t = core._t;

    var _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({

/*
        init_from_JSON: function (json) {
            var res = _super_Order.init_from_JSON.apply(this, arguments);
            if (json.auto_register_payment) {
                this.auto_register_payment = json.auto_register_payment;
            }
            return res;
        },
 */
        export_as_JSON: function () {
            var json = _super_Order.export_as_JSON.apply(this, arguments);
            // TODO check order values exported
            console.log('order to export ' + JSON.stringify(json));
//            if (this.auto_register_payment) {
//                json.auto_register_payment = this.auto_register_payment;
//            }
            return json;
        },
 /*
        set_partner_tax: function(taxes_amount) {
           this.partner_taxes_amount = taxes_amount;
           console.log('setting partner taxes amount ' +  this.partner_taxes_amount);
        },
        get_partner_tax: function() {
           return this.partner_taxes_amount;
        },
        get_order_total_with_taxes: function() {
            return this.get_total_without_tax() + this.get_order_total_tax();
        },
        get_order_total_tax: function() {
            return round_pr(this.orderlines.reduce((function(sum, orderLine) {
                return sum + orderLine.get_tax();
            }), 0), this.pos.currency.rounding);
        },
*/
    });


});

