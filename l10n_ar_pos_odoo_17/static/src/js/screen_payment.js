/** @odoo-module **/

import { patch } from '@web/core/utils/patch';
import { useWatch, useRef, useExternalListener, useEffect, useState, useEnv } from '@odoo/owl';
import { PaymentScreen } from '@point_of_sale/app/screens/payment_screen/payment_screen';
import { useService } from "@web/core/utils/hooks";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup(...arguments);

        this.inputbuffer = "";
        this.firstinput = true;
        this.popup = useService("popup");
        this.decimal_point = this.pos.config?.decimal_separator || '.';

        // Setear orden actual para facturación
        const order = this.pos.get_order();
        if (order) {
            order.set_to_invoice(true);
        }

        // 👉 Reacción al cambio de cliente
        useWatch(this, () => {
            const client = this.pos.get_order()?.get_client();
            if (client) {
                this.customer_changed?.();
            }
        });

        // 👉 Reacción al cambio de orden
        useWatch(this, () => {
            const order = this.pos.get_order();
            this.watch_order_changes?.();
        });

        // ⌨️ Teclado: handlers
        this.keyboard_keydown_handler = (event) => {
            if ([8, 46].includes(event.keyCode)) {
                event.preventDefault();
                this.keyboard_handler(event);
            }
        };

        this.keyboard_handler = (event) => {
            if (window.BarcodeEvents?.$barcodeInput?.is(":focus")) return;
            if (document.querySelector(".popup_credit_card:not(.oe_hidden)")) return;

            let key = '';
            if (event.type === "keypress") {
                switch (event.keyCode) {
                    case 13:
                        this.validate_order?.();
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
            } else {
                if (event.keyCode === 46) key = 'CLEAR';
                else if (event.keyCode === 8) key = 'BACKSPACE';
            }

            this.payment_input?.(key);
            event.preventDefault();
        };

        // Escuchar eventos globales si hace falta
        useExternalListener(window, 'keydown', this.keyboard_keydown_handler);
        useExternalListener(window, 'keypress', this.keyboard_handler);
    },

    async click_invoice() {
        await this._super(...arguments);
        const order = this.pos.get_order();

        if (order?.is_to_invoice()) {
            // No hace falta hacer nada si se va a facturar
        } else {
            await this.popup.add({
                title: this.env._t('Advertencia'),
                body: this.env._t('Se emitirá Comprobante sin Valor Fiscal'),
                confirmLabel: this.env._t('Aceptar'),
                cancelLabel: this.env._t('Cancelar'),
            });
        }
    },

    async click_paymentmethods(id) {
        await this._super(id);

        const order = this.pos.get_order();
        if (order) {
            order.set_to_invoice(true);
        }

        const selected_paymentline = order?.selected_paymentline;
        if (selected_paymentline) {
            try {
                const result = await this.rpc({
                    model: 'account.journal',
                    method: 'check_electronic_payment_method',
                    args: [selected_paymentline.cashregister.journal.id],
                });

                const is_electronic = String(result) === 'true';
                console.log('¿Es electrónico?', is_electronic);

                if (is_electronic) {
                    await this.popup.add({
                        title: this.env._t('Datos de la tarjeta'),
                        body: this.env._t('Ingrese los datos de la tarjeta de crédito...'),
                        confirmLabel: this.env._t('Aceptar'),
                    });
                }
            } catch (error) {
                if (error.code === 200) {
                    await this.popup.add({
                        title: error.data.message || "Error",
                        body: error.data.debug || "Error interno",
                        confirmLabel: "OK",
                    });
                }
            }
        }
    },
});
