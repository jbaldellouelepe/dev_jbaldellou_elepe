odoo.define('l10n_ar_pos_odoo.order_line', function (require) {
"use strict";

    var models = require('point_of_sale.models');
    var core = require('web.core');
    var rpc = require('web.rpc');
    var utils = require('web.utils');

    var round_pr = utils.round_precision;
    var qweb = core.qweb;
    var _t = core._t;

    var _super_Orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({

            get_all_prices: function(){
                var tax_result_dict = _super_Orderline.get_all_prices.apply(this, arguments);
                console.log('order line taxes computed ' + JSON.stringify(tax_result_dict));
                return tax_result_dict;
            },
            export_as_JSON: function () {
                var json = _super_Orderline.export_as_JSON.apply(this, arguments);
                // TODO check order values exported
                console.log('order line to export ' + JSON.stringify(json));
                return json;
            },
            get_applicable_taxes: function(){
                var i;
                // Shenaningans because we need
                // to keep the taxes ordering.
                var product =  this.get_product();
                var taxes_ids = _.filter(product.taxes_id, t => t in this.pos.taxes_by_id);
                var product_taxes = this.get_taxes_after_fp(taxes_ids);
                var ptaxes_set = {};
                for (i = 0; i < product_taxes.length; i++) {
                    ptaxes_set[product_taxes[i]['id']] = true;
                }
                var taxes = [];
                for (i = 0; i < this.pos.taxes.length; i++) {
                    if (ptaxes_set[this.pos.taxes[i].id]) {
                        taxes.push(this.pos.taxes[i]);
                    }
                }
                console.log('computed taxes in order line ' + JSON.stringify(taxes));
                return taxes;
            },
        
    });


});

