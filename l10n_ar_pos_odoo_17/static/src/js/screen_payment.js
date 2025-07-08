import { patch } from '@web/core/utils/patch';
import { PaymentScreenWidget } from 'point_of_sale.screens';
import { gui } from 'point_of_sale.gui'; // si necesitás

patch(PaymentScreenWidget.prototype, 'l10n_ar_pos_odoo.screen_payment', {
    init(parent, options) {
        this._super(parent, options);
        const order = this.env.pos.get_order();
        if (order) {
            order.set_to_invoice(true);
        }
        this.$('.js_invoice')?.addClass('highlight');

        this.env.pos.on('change:selectedOrder', () => {
            this.render();
            this.watch_order_changes();
        });

        this.watch_order_changes();

        this.inputbuffer = "";
        this.firstinput = true;
        this.decimal_point = this.env._t.database.parameters.decimal_point;

        this.keyboard_keydown_handler = (event) => {
            if ([8, 46].includes(event.keyCode)) { // Backspace/Delete
                event.preventDefault();
                this.keyboard_handler(event);
            }
        };

        this.keyboard_handler = (event) => {
            if (window.BarcodeEvents?.$barcodeInput?.is(":focus")) {
                return;
            }
            if (document.querySelector(".popup_credit_card:not(.oe_hidden)")) {
                return;
            }

            let key = '';
            if (event.type === "keypress") {
                switch(event.keyCode) {
                    case 13: // Enter
                        this.validate_order();
                        break;
                    case 190: case 110: case 188: case 46:
                        key = this.decimal_point;
                        break;
                    default:
                        if (event.keyCode >= 48 && event.keyCode <= 57) {
                            key = String(event.keyCode - 48);
                        } else if (event.keyCode === 45) {
                            key = '-';
                        } else if (event.keyCode === 43) {
                            key = '+';
                        }
                }
            } else { // keydown/keyup
                if (event.keyCode === 46) key = 'CLEAR';
                else if (event.keyCode === 8) key = 'BACKSPACE';
            }
            this.payment_input(key);
            event.preventDefault();
        };

        this.env.pos.on('change:selectedClient', () => {
            this.customer_changed();
        });
    },

    async click_invoice() {
        await this._super(...arguments);
        const order = this.env.pos.get_order();
        if (order?.is_to_invoice()) {
            this.$('.js_invoice')?.addClass('highlight');
        } else {
            this.env.pos.gui.show_popup('confirm', {
                title: this.env._t('Warning'),
                body: this.env._t('Se emitirá Comprobante sin Valor Fiscal'),
                confirm: () => {
                    this.$('.js_invoice')?.removeClass('highlight');
                },
            });
        }
    },

    async click_paymentmethods(id) {
        await this._super(id);
        const order = this.env.pos.get_order();
        if (order) {
            order.set_to_invoice(true);
        }
        this.$('.js_invoice')?.addClass('highlight');
        const selected_paymentline = order?.selected_paymentline;
        if (selected_paymentline) {
            try {
                const result = await this.rpc({
                    model: 'account.journal',
                    method: 'check_electronic_payment_method',
                    args: [selected_paymentline.cashregister.journal.id],
                });
                const is_electronic = String(result) === 'true';
                console.log('payment journal is electronic?', is_electronic);
                if (is_electronic) {
                    this.env.pos.gui.show_popup('popup_credit_card', {
                        title: this.env._t('Credit Card Info'),
                    });
                }
            } catch (error) {
                if (error.code === 200) {
                    this.env.pos.gui.show_popup('error-traceback', {
                        title: error.data.message,
                        body: error.data.debug,
                    });
                }
            }
        }
    },
});
