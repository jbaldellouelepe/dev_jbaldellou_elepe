import { patch } from '@web/core/utils/patch';
import { PosModel } from 'point_of_sale.models';

patch(PosModel.prototype, 'l10n_ar_pos_odoo.model', {
    initialize() {
        this.pos_relation_by_id = {};
        this.journal_index = {};
        this.journal_by_responsibility = {};
        this.journal_list = [];
        this.repartition_lines = [];
        this.repartition_lines_by_id = {};
        this.tags = [];
        this.tags_by_id = {};
        this._super(...arguments);
    },

    _compute_all(tax, base_amount, quantity, price_exclude) {
        let tax_amount = this._super(...arguments);
        console.log('tax amount computed', tax_amount);

        const price_include = price_exclude === undefined ? tax.price_include : !price_exclude;

        if (tax.amount_type === 'partner_tax') {
            if (!price_include) {
                console.log('computing partner tax');
                tax_amount = (base_amount * tax.amount).toFixed(2);
                console.log('tax amount computed', tax_amount);
                return tax_amount;
            }
            if (price_include) {
                console.log('computing partner tax');
                tax_amount = (base_amount - (base_amount / (1 + tax.amount))).toFixed(2);
                console.log('tax amount computed', tax_amount);
                return tax_amount;
            }
        } else {
            return tax_amount;
        }
        return false;
    },

    get_taxes_after_fp(taxes_ids, order = false) {
        const taxes = this.taxes;
        let product_taxes = [];

        taxes_ids.forEach((el) => {
            const tax = taxes.find(t => t.id === el);
            product_taxes.push(...this._map_tax_fiscal_position(tax, order));
        });

        const client = this.get_order()?.get_client();

        if (client && this.partner_taxes_by_id?.[client.id]) {
            this.partner_taxes_by_id[client.id].forEach((partner_tax) => {
                const tax = taxes.find(t => t.id === partner_tax.id);
                if (tax) {
                    tax.amount = partner_tax.amount;
                    product_taxes.push(...this._map_tax_fiscal_position(tax, order));
                }
            });
        }

        // Unique taxes by id
        product_taxes = [...new Map(product_taxes.map(tax => [tax.id, tax])).values()];

        console.log('product taxes', product_taxes);
        return product_taxes;
    },
});
