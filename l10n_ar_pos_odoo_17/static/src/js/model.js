/** @odoo-module **/

import { patch } from '@web/core/utils/patch';
import { PosStore } from '@point_of_sale/app/store/pos_store';

patch(PosStore.prototype, {
    // @Override
    async setup() {
        // Tu lógica personalizada
        this.pos_relation_by_id = {};
        this.journal_index = {};
        this.journal_by_responsibility = {};
        this.journal_list = [];
        this.repartition_lines = [];
        this.repartition_lines_by_id = {};
        this.tags = [];
        this.tags_by_id = {};
        await super.setup(...arguments);

        console.log('✅ PosStore patch setup ejecutado correctamente');
    },

    _compute_all(tax, base_amount, quantity, price_exclude) {
        const superMethod = Object.getPrototypeOf(PosStore.prototype)._compute_all;
        let tax_amount = superMethod?.call(this, tax, base_amount, quantity, price_exclude);
        const price_include = price_exclude === undefined ? tax.price_include : !price_exclude;

        if (tax.amount_type === 'partner_tax') {
            if (!price_include) {
                tax_amount = (base_amount * tax.amount).toFixed(2);
            } else {
                tax_amount = (base_amount - (base_amount / (1 + tax.amount))).toFixed(2);
            }
            return tax_amount;
        }
        return tax_amount;
    },

    _map_tax_fiscal_position(tax, order = false) {
        if (!tax || !tax.fiscal_position_ids || !tax.fiscal_position_ids.length) {
            return [tax];
        }

        const order_fp = order?.get_fiscal_position?.();
        const fiscal_position_id = order_fp?.id;

        if (!fiscal_position_id) {
            return [tax];
        }

        const mapping = this.fiscal_positions_map?.[fiscal_position_id]?.[tax.id];
        if (!mapping) {
            return [tax];
        }

        return mapping.map(t => this.taxes_by_id[t]);
    },
});
