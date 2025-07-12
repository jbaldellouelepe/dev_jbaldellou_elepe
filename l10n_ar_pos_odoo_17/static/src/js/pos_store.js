/** @odoo-module **/

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";

//const originalStart = PosStore.prototype.start;
patch(PosStore.prototype, {
    async setup() {
        // Inicializar las estructuras de datos
        this.pos_relation_by_id = {};
        this.journal_index = {};
        this.journal_by_responsibility = {};
        this.journal_list = [];
        this.repartition_lines = [];
        this.repartition_lines_by_id = {};
        this.tags = [];
        this.tags_by_id = {};

        // Asegurarnos que la configuración base esté disponible
        this.config = this.config || {};
        this.config.iface_customer_facing_display = false; // valor por defecto
        await super.setup(...arguments);
        console.log('PosStore loaded - pos_store.js');
    },
    // @Override
    async _processData(loadedData) {
        await super._processData(...arguments);
        if (this.isArgentineanCompany()) {
            this.afip_responsibilities = loadedData["l10n_ar.afip.responsibility.type"];
            this.document_types = loadedData["l10n_latam.identification.type"];
        }
    },
    isArgentineanCompany() {
        return this.company.country?.code == "AR";
    },
});


//patch(PosStore.prototype, {
//    setup() {
//        // Inicializar las estructuras de datos
//        this.pos_relation_by_id = {};
//        this.journal_index = {};
//        this.journal_by_responsibility = {};
//        this.journal_list = [];
//        this.repartition_lines = [];
//        this.repartition_lines_by_id = {};
//        this.tags = [];
//        this.tags_by_id = {};
//
//        // Asegurarnos que la configuración base esté disponible
//        this.config = this.config || {};
//        this.config.iface_customer_facing_display = false; // valor por defecto
//        console.log('PosStore loaded - pos_store.js');
//    },

//    async start() {
//        if (originalStart) {
//            await originalStart.apply(this, arguments);
//        }
//        // Ahora tu código personalizado después del start original
//        await this.load_l10n_ar_data();
//    },
//
//    async load_l10n_ar_data() {
//        try {
//            if (!this.partners) {
//                return;
//            }
//
//            const partnerIds = this.partners.map(partner => partner.id);
//
//            // Usar this.env.services.rpc en lugar de this.rpc
//            const [partner_taxes, document_types, afip_responsibilities] = await Promise.all([
//                this.env.services.rpc({
//                    model: 'res.partner',
//                    method: 'get_all_partner_taxes',
//                    args: [partnerIds],
//                }),
//                this.env.services.rpc({
//                    model: 'l10n_latam.identification.type',
//                    method: 'search_read',
//                    args: [[], ['name']],
//                }),
//                this.env.services.rpc({
//                    model: 'l10n_ar.afip.responsibility.type',
//                    method: 'search_read',
//                    args: [[], ['name', 'code']],
//                }),
//            ]);
//
//            this.partner_taxes_by_id = {};
//            partner_taxes.forEach(partner_tax => {
//                if (!this.partner_taxes_by_id[partner_tax.partner_id]) {
//                    this.partner_taxes_by_id[partner_tax.partner_id] = [];
//                }
//                this.partner_taxes_by_id[partner_tax.partner_id].push(partner_tax);
//            });
//
//            this.document_types = document_types;
//            this.afip_responsibilities = afip_responsibilities;
//
//            if (this.db) {
//                this.db.add_responsibilities(afip_responsibilities);
//            }
//        } catch (error) {
//            console.error('Error loading l10n_ar data:', error);
//        }
//    }
});