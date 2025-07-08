import { patch } from '@web/core/utils/patch';
import { Order } from 'point_of_sale.models';

patch(Order.prototype, 'l10n_ar_pos_odoo.order', {
    export_as_JSON() {
        const json = this._super(...arguments);
        console.log('order to export', json);
        // si querés agregar más campos al json, hacelo acá
        return json;
    },

    // Si querés descomentar y usar más métodos, podés agregar acá.
    /*
    init_from_JSON(json) {
        const res = this._super(...arguments);
        if (json.auto_register_payment) {
            this.auto_register_payment = json.auto_register_payment;
        }
        return res;
    },

    set_partner_tax(taxes_amount) {
        this.partner_taxes_amount = taxes_amount;
        console.log('setting partner taxes amount', this.partner_taxes_amount);
    },

    get_partner_tax() {
        return this.partner_taxes_amount;
    },

    get_order_total_with_taxes() {
        return this.get_total_without_tax() + this.get_order_total_tax();
    },

    get_order_total_tax() {
        return round_pr(
            this.orderlines.reduce((sum, orderLine) => sum + orderLine.get_tax(), 0),
            this.pos.currency.rounding
        );
    },
    */
});
