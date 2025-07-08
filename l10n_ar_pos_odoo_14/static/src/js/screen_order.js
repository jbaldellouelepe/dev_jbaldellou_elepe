"use strict";
odoo.define('l10n_ar_pos_odoo.screen_order', function (require) {

    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    var BarcodeEvents = require('barcodes.BarcodeEvents').BarcodeEvents;
    var core = require('web.core');
    var utils = require('web.utils');
    var round_pr = utils.round_precision;
    var _t = core._t;
    var rpc = require('web.rpc');
    var qweb = core.qweb;

    screens.OrderWidget.include({

        update_summary: function(){
            var order = this.pos.get_order();
            var self = this;
            if (!order.get_orderlines().length) {
                return;
            }

            var total     = order ? order.get_order_total_with_taxes() : 0;
            var taxes     = order ? total - order.get_total_without_tax() : 0;
            var other_taxes_conv = 0.00;

            var amount_untaxed = order.get_total_without_tax();
            var client_id = order.get_client() ? order.get_client().id : false;
            if (client_id) {
                this._rpc({model: 'res.partner',method: 'pos_get_other_taxes',
                    args: [ client_id, amount_untaxed]})
                    .then(function (other_taxes) {
                        var other_taxes_amount = other_taxes['other_taxes'];
                        if (other_taxes_amount != 0) {
                            other_taxes_conv = round_pr( other_taxes_amount, self.pos.currency.rounding);
                            total += other_taxes_conv;
                        }
                        order.set_partner_tax(other_taxes_conv);
                        self.el.querySelector('.summary .total > .value').textContent = self.format_currency(total);
                        self.el.querySelector('.summary .total .subentry .value').textContent = self.format_currency(taxes);
                        self.el.querySelector('.summary .total .subentry_taxes .value').textContent = self.format_currency(other_taxes_conv);

                    });;
            } else {
                order.set_partner_tax(other_taxes_conv);
                this.el.querySelector('.summary .total > .value').textContent = this.format_currency(total);
                this.el.querySelector('.summary .total .subentry .value').textContent = this.format_currency(taxes);
                this.el.querySelector('.summary .total .subentry_taxes .value').textContent = this.format_currency(other_taxes_conv);

            }
        },

    });

    return {
        OrderWidget: screens.OrderWidget,
    };

});
