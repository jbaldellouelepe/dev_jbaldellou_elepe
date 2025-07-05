"use strict";
odoo.define('l10n_ar_pos_odoo.screen_payment', function (require) {

    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    var BarcodeEvents = require('barcodes.BarcodeEvents').BarcodeEvents;
    var core = require('web.core');
    var _t = core._t;
    var rpc = require('web.rpc');
    var qweb = core.qweb;

    screens.PaymentScreenWidget.include({

        init: function(parent, options) {
            var self = this;
            this._super(parent, options);
            var order = self.pos.get_order();
            order.set_to_invoice(true);
            this.$('.js_invoice').addClass('highlight');

            this.pos.bind('change:selectedOrder',function(){
                    this.renderElement();
                    this.watch_order_changes();
                },this);
            this.watch_order_changes();

            this.inputbuffer = "";
            this.firstinput  = true;
            this.decimal_point = _t.database.parameters.decimal_point;

            // This is a keydown handler that prevents backspace from
            // doing a back navigation. It also makes sure that keys that
            // do not generate a keypress in Chrom{e,ium} (eg. delete,
            // backspace, ...) get passed to the keypress handler.
            this.keyboard_keydown_handler = function(event){
                if (event.keyCode === 8 || event.keyCode === 46) { // Backspace and Delete
                    event.preventDefault();

                    // These do not generate keypress events in
                    // Chrom{e,ium}. Even if they did, we just called
                    // preventDefault which will cancel any keypress that
                    // would normally follow. So we call keyboard_handler
                    // explicitly with this keydown event.
                    self.keyboard_handler(event);
                }
            };

            // This keyboard handler listens for keypress events. It is
            // also called explicitly to handle some keydown events that
            // do not generate keypress events.
            this.keyboard_handler = function(event){
                // On mobile Chrome BarcodeEvents relies on an invisible
                // input being filled by a barcode device. Let events go
                // through when this input is focused.
                if (BarcodeEvents.$barcodeInput && BarcodeEvents.$barcodeInput.is(":focus")) {
                    return;
                }
                // allow keyboard entry if Credit Card popup is active
                console.log('verify credit card popup');
                if($(".popup_credit_card").not('.oe_hidden').length)  {
                     return;
                }
                var key = '';

                if (event.type === "keypress") {
                    if (event.keyCode === 13) { // Enter
                        self.validate_order();
                    } else if ( event.keyCode === 190 || // Dot
                                event.keyCode === 110 ||  // Decimal point (numpad)
                                event.keyCode === 188 ||  // Comma
                                event.keyCode === 46 ) {  // Numpad dot
                        key = self.decimal_point;
                    } else if (event.keyCode >= 48 && event.keyCode <= 57) { // Numbers
                        key = '' + (event.keyCode - 48);
                    } else if (event.keyCode === 45) { // Minus
                        key = '-';
                    } else if (event.keyCode === 43) { // Plus
                        key = '+';
                    }
                } else { // keyup/keydown
                    if (event.keyCode === 46) { // Delete
                        key = 'CLEAR';
                    } else if (event.keyCode === 8) { // Backspace
                        key = 'BACKSPACE';
                    }
                }
                self.payment_input(key);
                event.preventDefault();
            };

            this.pos.bind('change:selectedClient', function() {
                self.customer_changed();
            }, this);
        },
        click_invoice: function () {
            this._super();
            var order = this.pos.get_order();
            if (order.is_to_invoice()) {
                this.$('.js_invoice').addClass('highlight');
            } else {
                return this.pos.gui.show_popup('confirm', {
                    'title': _t('Warning'),
                    'body': _t('Se emitirá Comprobante sin Valor Fiscal'),
                    confirm: function () {
                        this.$('.js_invoice').removeClass('highlight');
                    }
                });
            }
        },
        click_paymentmethods: function (id) {
            // id : id of journal
            var self = this;
            this._super(id);
            var order = this.pos.get_order();
            order.set_to_invoice(true);
            this.$('.js_invoice').addClass('highlight');
            var selected_paymentline = order.selected_paymentline;
            var client = order.get_client();
            var is_electronic = false;
            // if cashregister.journal is electronic then show credit card popup
            if (selected_paymentline) {
                rpc.query({
                   model: 'account.journal',
                   method: 'check_electronic_payment_method',
                   args: [selected_paymentline.cashregister.journal['id']],
                }).then(function (result) {
                   var flag = String(result);
                   if (flag == 'true') {this.is_electronic = true;}
                   if (flag == 'false') {this.is_electronic = false;}
                   console.log('payment journal is electronic? ' + this.is_electronic);
                   if (this.is_electronic) {
                     self.pos.gui.show_popup('popup_credit_card', {
                       'title': _t('Credit Card Info')
                     });
                   }
                }).fail(function (type, error) {
                    if(error.code === 200 ){
                         self.gui.show_popup('error-traceback',{
                               'title': error.data.message,
                               'body':  error.data.debug
                         });
                    }
                });
            }
        },
    });

    return {
        PaymentScreenWidget: screens.PaymentScreenWidget,
    };

});
