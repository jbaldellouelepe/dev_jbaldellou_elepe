odoo.define('l10n_ar_pos_odoo.payment_line', function (require) {

    var core = require('web.core');
    var _t = core._t;
    var gui = require('point_of_sale.gui');
    var PopupWidget = require('point_of_sale.popups');
    var rpc = require('web.rpc');
    var models = require('point_of_sale.models');
    var qweb = core.qweb;

    // Additional Info for Credit Cards
    // -- Keyboard event must be active in POS Session Config and Credit Card journals must be configured as electronic
    var _super_paymentline = models.Paymentline.prototype;
    models.Paymentline = models.Paymentline.extend({
        initialize: function (attributes, options) {
            _super_paymentline.initialize.apply(this, arguments);
            this.device_ticket_nbr = null;
            this.device_lot_nbr = null;
        },
        set_ticket_nbr: function (value) {
            this.device_ticket_nbr = value;
            this.trigger('change', this);
        },
        set_lot_nbr: function (value) {
            this.device_lot_nbr = value;
            this.trigger('change', this);
        },
        get_ticket_nbr: function(){
           return this.device_ticket_nbr;
        },
        get_lot_nbr: function(){
           return this.device_lot_nbr;
        },
        export_as_JSON: function () {
            var json = _super_paymentline.export_as_JSON.apply(this, arguments);
            if (this.device_ticket_nbr) {
                json['device_ticket_nbr'] = this.device_ticket_nbr;
            }
            if (this.device_lot_nbr) {
                json['device_lot_nbr'] = this.device_lot_nbr;
            }
            return json;
        },
        export_for_printing: function () {
            var json = _super_paymentline.export_for_printing.call(this);
            if (this.device_ticket_nbr) {
                json['device_ticket_nbr'] = this.device_ticket_nbr;
            }
            if (this.device_lot_nbr) {
                json['device_lot_nbr'] = this.device_lot_nbr;
            }
            return json;
        },
    });

    return {
        Paymentline: models.Paymentline,
    };


});
