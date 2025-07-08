import { patch } from '@web/core/utils/patch';
import { OrderWidget } from 'point_of_sale.screens';

patch(OrderWidget.prototype, 'l10n_ar_pos_odoo.screen_order', {
    async update_summary() {
        const order = this.env.pos.get_order();
        if (!order || !order.get_orderlines().length) {
            return;
        }

        let total = order.get_order_total_with_taxes();
        let taxes = total - order.get_total_without_tax();
        let other_taxes_conv = 0.00;

        const amount_untaxed = order.get_total_without_tax();
        const client = order.get_client();
        if (client) {
            try {
                const other_taxes = await this.rpc({
                    model: 'res.partner',
                    method: 'pos_get_other_taxes',
                    args: [client.id, amount_untaxed],
                });
                const other_taxes_amount = other_taxes['other_taxes'];
                if (other_taxes_amount !== 0) {
                    other_taxes_conv = this.env.pos.round_di(total = other_taxes_amount); // O usar round_precision si importas utils
                    total += other_taxes_conv;
                }
                order.set_partner_tax(other_taxes_conv);
            } catch (error) {
                console.error('Error fetching other taxes', error);
            }
        } else {
            order.set_partner_tax(other_taxes_conv);
        }

        // Actualizar valores en DOM
        this.el.querySelector('.summary .total > .value').textContent = this.format_currency(total);
        this.el.querySelector('.summary .total .subentry .value').textContent = this.format_currency(taxes);
        this.el.querySelector('.summary .total .subentry_taxes .value').textContent = this.format_currency(other_taxes_conv);
    },
});
