odoo.define('l10n_ar_pos_odoo.model', function (require) {
    var models = require('point_of_sale.models');
    var core = require('web.core');
    var _t = core._t;

    var PosModelSuper = models.PosModel;
    //var _super_PosModel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function (attributes) {
            var self = this;
            this.pos_relation_by_id = {};
            this.journal_index = {};
            this.journal_by_responsibility = {};
            this.journal_list = [];
            this.repartition_lines = [];
            this.repartition_lines_by_id = {};
            this.tags = [];
            this.tags_by_id = {};
            PosModelSuper.prototype.initialize.apply(this, arguments);
        },
            /**
         * Mirror JS method of:
         * _compute_amount in addons/account/models/account.py
         */
        _compute_all: function(tax, base_amount, quantity, price_exclude) {
            var tax_amount = PosModelSuper.prototype._compute_all.apply(this, arguments);
            console.log('tax amount computed ' + tax_amount);
            // TODO check rounding in partner taxes
            if(price_exclude === undefined)
                var price_include = tax.price_include;
            else
                var price_include = !price_exclude;
            if (tax.amount_type === 'partner_tax'){
                if (!price_include){
                    console.log('computing partner tax');
                    tax_amount = (base_amount * tax.amount).toFixed(2);
                    console.log('tax amount computed ' + tax_amount);
                    return tax_amount;
                }
                if (price_include){
                    console.log('computing partner tax');
                    tax_amount = (base_amount - (base_amount / (1 + tax.amount))).toFixed(2);
                    console.log('tax amount computed ' + tax_amount);
                    return tax_amount;
                }
            }
            else {
              return tax_amount;
            }
            return false;
        },
        get_taxes_after_fp: function(taxes_ids, order = false){
            var self = this;
            var taxes =  this.taxes;
            var product_taxes = [];
            _(taxes_ids).each(function(el){
                var tax = _.detect(taxes, function(t){
                    return t.id === el;
                });
                product_taxes.push.apply(product_taxes, self._map_tax_fiscal_position(tax, order));
            });
            // Begin Get Partner Taxes
            var client = undefined;
            var current_order = this.get_order();
            if (current_order) {
                client = current_order.get_client();
                console.log(' order client ' + JSON.stringify(client));
            }
            if (client != undefined && self.partner_taxes_by_id[client["id"]] != undefined) {
                console.log('getting client id ' + client['id']);
                console.log('partner taxes loaded ' + JSON.stringify(self.partner_taxes_by_id[client['id']]));
                _(self.partner_taxes_by_id[client["id"]]).each(function(partner_tax){
                    console.log('partner tax located ' + JSON.stringify(partner_tax));
                    var tax = _.detect(taxes, function(t){
                        return t.id === partner_tax["id"];
                    });
                    console.log(' tax located ' + JSON.stringify(tax));
                    tax.amount = partner_tax["amount"];
                    console.log('partner tax name ' + tax.name);
                    product_taxes.push.apply(product_taxes, self._map_tax_fiscal_position(tax, order));
                });
            }
            // End Get Partner Taxes
            product_taxes = _.uniq(product_taxes, function(tax) { return tax.id; });
            console.log('product taxes ' + JSON.stringify(product_taxes));
            return product_taxes;
          },

    });

//    models.load_fields("res.partner", ['l10n_ar_afip_responsibility_type_id','l10n_latam_identification_type_id', 'arba_alicuot_ids']);

//    models.load_fields("account.tax", ['invoice_repartition_line_ids']);

    models.load_fields("res.company", ['max_ticket_amount','max_ticket_electronic_amount']);

    models.load_fields("pos.order", ['auto_register_payment']);

    models.load_models([
        {
            model:  'res.partner',
            label: 'load_partners_extended',
            fields: ['name','street','city','state_id','country_id','vat','lang',
                     'phone','zip','mobile','email','barcode','write_date',
                     'property_account_position_id','property_product_pricelist',
                     'l10n_ar_afip_responsibility_type_id','l10n_latam_identification_type_id', 'arba_alicuot_ids'],
            loaded: function(self,partners){
                self.partners = partners;
                self.db.add_partners(partners);
                self.partner_taxes_by_id = {};
                return new Promise(function (resolve, reject) {
                  var partner_ids = _.pluck(self.partners, 'id');
                  self.rpc({
                      model: 'res.partner',
                      method: 'get_all_partner_taxes',
                      args: [partner_ids],
                  }).then(function (partner_taxes) {
                      _.each(partner_taxes, function (partner_tax) {
                          if (self.partner_taxes_by_id[partner_tax.partner_id] === undefined)
                           {
                             let group_taxes = [partner_tax];
                             self.partner_taxes_by_id[partner_tax.partner_id] = group_taxes;
                           }
                           else {
                              self.partner_taxes_by_id[partner_tax.partner_id].push(partner_tax);
                           }
                      });
                      console.log('partner taxes loaded ' + JSON.stringify(self.partner_taxes_by_id));
                      resolve();
                  });
                });

            },
        },
        {
            model: 'l10n_latam.identification.type',
            fields: ['name'],
            domain: [],
            loaded: function (self, document_types) {
                self.document_types = document_types;
            }
        }, {
            model: 'l10n_ar.afip.responsibility.type',
            fields: ['name','code'],
            domain: [],
            loaded: function (self, afip_responsibilities) {
                self.afip_responsibilities = afip_responsibilities;
                self.db.add_responsibilities(afip_responsibilities);
            }
        }, {
            model: 'afip.pos.relation',
            fields: [],
            domain: function (self) {
                return [['id', 'in', self.config.afip_relation_ids]]
            },
            loaded: function (self, afip_pos_relations) {
                var i = 0;
                console.log('loading POS relations...');
                self.afip_pos_relations = afip_pos_relations;
                for (var i = 0; i < afip_pos_relations.length; i++) {
                  console.log('POS Relation ' + afip_pos_relations[i]['name']);
                }
                _.each(afip_pos_relations, function(afip_pos_relation){
                    self.pos_relation_by_id[afip_pos_relation.id] = afip_pos_relations;
                    self.journal_index[i] = afip_pos_relation.responsibility_id[0];
                    self.journal_by_responsibility[self.journal_index[i]] = afip_pos_relation.pos_journal_id[0];
                    console.log('POS relation:' + self.pos_relation_by_id[afip_pos_relation.id]['name']);
                    console.log('POS journal:' + self.journal_by_responsibility[self.journal_index[i]]['name']);
                    self.journal_list.push(afip_pos_relation.pos_journal_id[0]);
                    i++;
                });
            }
        },{
            model:  'account.account.tag',
            fields: ['name','applicability'],
            domain: function(self) {return [['applicability', '=', 'taxes'],['active', '=', true]]},
            loaded: function(self, tags){
                self.tags = tags;
                _.each(tags, function(tag){
                    self.tags_by_id[tag.id] = tag;
                });
            }
        },{
            model:  'account.tax.repartition.line',
            fields: ['sequence', 'tax_id','repartition_type', 'tag_ids'],
            domain: function(self) {return [['company_id', '=', self.company && self.company.id || false]]},
            loaded: function(self, repartition_lines){
                self.repartition_lines = repartition_lines;
                _.each(repartition_lines, function(repartition){
                    self.repartition_lines_by_id[repartition.id] = repartition;
                });
                _.each(self.repartition_lines_by_id, function(repartition) {
                    if (repartition.tag_ids) {
                        repartition.tag_ids = _.map(repartition.tag_ids, function (tag_id) {
                            return self.tags_by_id[tag_id];
                        });
                    }
                });
            }
        },{
            model:  'account.tax',
            fields: ['name','amount', 'price_include', 'include_base_amount', 'amount_type', 'children_tax_ids','invoice_repartition_line_ids'],
            domain: function(self) {return [['company_id', '=', self.company && self.company.id || false]]},
            loaded: function(self, taxes){
                self.taxes = taxes;
                self.taxes_by_id = {};
                _.each(taxes, function(tax){
                    self.taxes_by_id[tax.id] = tax;
                });
                _.each(self.taxes_by_id, function(tax) {
                    tax.children_tax_ids = _.map(tax.children_tax_ids, function (child_tax_id) {
                        return self.taxes_by_id[child_tax_id];
                    });
                    tax.invoice_repartition_line_ids = _.map(tax.invoice_repartition_line_ids, function (repartition_id) {
                        return self.repartition_lines_by_id[repartition_id];
                    });
                    console.log('loading tax ' + JSON.stringify(tax));
                });
                return new Promise(function (resolve, reject) {
                  var tax_ids = _.pluck(self.taxes, 'id');
                  self.rpc({
                      model: 'account.tax',
                      method: 'get_real_tax_amount',
                      args: [tax_ids],
                  }).then(function (taxes) {
                      _.each(taxes, function (tax) {
                          self.taxes_by_id[tax.id].amount = tax.amount;
                      });
                      resolve();
                  });
                });
            }
        },

/*        {
            model: 'account.journal',
            fields: [],
            domain: function (self) {
                return [['id', 'in', self.journal_list]]
            },
            loaded: function (self, journals) {
                console.log('loading journals...');
                self.journals = journals;
                self.journal_by_id = {};
                for (var i = 0; i < journals.length; i++) {
                    console.log('Invoice Journal : ' + journals[i]['name']);
                    self.journal_by_id[journals[i]['id']] = journals[i];
                }
            }
        },
*/
    ]);

});
