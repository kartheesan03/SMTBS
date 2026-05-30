const { Op } = require('sequelize');
const sequelize = require('./sequelize');

// Global registry of models to resolve populate references
const modelRegistry = {};

function registerModel(name, bridgedModel) {
    modelRegistry[name] = bridgedModel;
}

function translateQuery(query, model) {
    if (!query) return {};
    const sequelizeQuery = {};
    for (const [key, value] of Object.entries(query)) {
        // Handle $or operator: translate each branch recursively
        if (key === '$or' && Array.isArray(value)) {
            sequelizeQuery[Op.or] = value.map(branch => translateQuery(branch, model));
            continue;
        }
        // Handle $and operator
        if (key === '$and' && Array.isArray(value)) {
            sequelizeQuery[Op.and] = value.map(branch => translateQuery(branch, model));
            continue;
        }
        // Handle $expr operator (column-to-column comparisons)
        if (key === '$expr' && value && typeof value === 'object') {
            // Support { $lte: ['$colA', '$colB'] } → colA <= colB
            const exprOps = { '$lte': '<=', '$gte': '>=', '$lt': '<', '$gt': '>', '$eq': '=' };
            for (const [exprOp, operands] of Object.entries(value)) {
                if (exprOps[exprOp] && Array.isArray(operands) && operands.length === 2) {
                    const left = operands[0].startsWith('$') ? operands[0].substring(1) : operands[0];
                    const right = operands[1].startsWith('$') ? operands[1].substring(1) : operands[1];
                    sequelizeQuery[Op.and] = sequelizeQuery[Op.and] || [];
                    sequelizeQuery[Op.and].push(
                        sequelize.literal(`"${left}" ${exprOps[exprOp]} "${right}"`)
                    );
                }
            }
            continue;
        }

        let mappedKey = key === '_id' ? 'id' : key;
        
        // Handle virtual associations to underlying foreign keys (e.g. employee -> employeeId)
        if (model && model.rawAttributes && !model.rawAttributes[mappedKey] && model.rawAttributes[mappedKey + 'Id']) {
            mappedKey = mappedKey + 'Id';
        }
        if (model && model.rawAttributes && !model.rawAttributes[mappedKey] && model.rawAttributes[mappedKey + 'Field']) {
            mappedKey = mappedKey + 'Field';
        }
        if (model && model.rawAttributes && !model.rawAttributes[mappedKey] && model.rawAttributes[mappedKey + 'Model']) {
            // Polymorphic mapping: customer -> customerId or lead -> leadId
            if (value && typeof value === 'string') {
                // If query is an ID
                sequelizeQuery[Op.or] = [
                    { customerId: value },
                    { leadId: value }
                ];
                continue;
            }
        }

        // Support JSON array query matching (e.g. assignedTo contains user ID)
        if (model && model.rawAttributes && model.rawAttributes[mappedKey] && model.rawAttributes[mappedKey].type.constructor.name === 'JSON') {
            sequelizeQuery[Op.and] = sequelizeQuery[Op.and] || [];
            // Use LIKE for cross-dialect compatibility (SQLite has no JSON_CONTAINS)
            const searchVal = typeof value === 'string' ? value : JSON.stringify(value);
            sequelizeQuery[Op.and].push(
                sequelize.literal(`"${mappedKey}" LIKE '%${searchVal.replace(/'/g, "''")}%'`)
            );
            continue;
        }

        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            const opConditions = {};
            for (const [op, opVal] of Object.entries(value)) {
                if (op === '$in') opConditions[Op.in] = opVal;
                else if (op === '$nin') opConditions[Op.notIn] = opVal;
                else if (op === '$gte') opConditions[Op.gte] = opVal;
                else if (op === '$lte') opConditions[Op.lte] = opVal;
                else if (op === '$gt') opConditions[Op.gt] = opVal;
                else if (op === '$lt') opConditions[Op.lt] = opVal;
                else if (op === '$ne') opConditions[Op.ne] = opVal;
                else if (op === '$exists') {
                    if (opVal) opConditions[Op.ne] = null;
                    else opConditions[Op.eq] = null;
                }
                else opConditions[op] = opVal;
            }
            sequelizeQuery[mappedKey] = opConditions;
        } else {
            sequelizeQuery[mappedKey] = value;
        }
    }
    return sequelizeQuery;
}

// Wrap Sequelize instances to resemble Mongoose documents
function wrapInstance(instance, modelName) {
    if (!instance) return null;
    
    // If it's already wrapped or is a plain object
    if (instance._wrapped) return instance;

    // Create a proxy to intercept _id, toJSON, and other Mongoose-specific methods
    const proxy = new Proxy(instance, {
        get(target, prop, receiver) {
            if (prop === '_id') {
                return target.id;
            }
            if (prop === '_wrapped') {
                return true;
            }
            if (prop === 'toObject' || prop === 'toJSON') {
                return function() {
                    const plain = target.toJSON ? target.toJSON() : target;
                    plain._id = target.id;
                    // Mongoose virtuals compatibility
                    if (modelName === 'Leave') {
                        const ms = new Date(plain.endDate) - new Date(plain.startDate);
                        plain.days = Math.ceil(ms / 86400000) + 1;
                    }
                    if (modelName === 'Order' || modelName === 'Ticket') {
                        plain.customer = plain.Customer || plain.Lead || null;
                    }
                    return plain;
                };
            }
            if (prop === 'populate') {
                return function(path) {
                    // Mongoose populate on loaded instance: returns this instance
                    return Promise.resolve(proxy);
                };
            }
            if (prop === 'save') {
                return async function(...args) {
                    await target.save(...args);
                    return receiver;
                };
            }
            if (prop === 'deleteOne' || prop === 'remove') {
                return async function() {
                    await target.destroy();
                    return receiver;
                };
            }
            
            if (prop === 'customer' && (modelName === 'Order' || modelName === 'Ticket')) {
                const customerVal = target.Customer || target.Lead || null;
                if (customerVal && typeof customerVal === 'object' && customerVal.dataValues && !customerVal._wrapped) {
                    const assocModelName = customerVal.constructor.name;
                    return wrapInstance(customerVal, assocModelName);
                }
                return customerVal;
            }
            if (prop === 'userId' && target.userIdField !== undefined) {
                return target.userIdField;
            }
            if (prop === 'assignedTo' && target.assignedToField !== undefined) {
                return target.assignedToField;
            }
            if (prop === 'createdBy' && target.createdByField !== undefined) {
                return target.createdByField;
            }
            
            // Standard property retrieval
            const value = Reflect.get(target, prop, receiver);
            
            // Return function wrapper bound to standard context
            if (typeof value === 'function') {
                return value.bind(target);
            }
            
            if (value && typeof value === 'object' && value.dataValues && !value._wrapped) {
                const assocModelName = value.constructor.name;
                return wrapInstance(value, assocModelName);
            }
            
            return value;
        },
        set(target, prop, value, receiver) {
            let mappedProp = prop === '_id' ? 'id' : prop;
            if (mappedProp === 'userId' && target.userIdField !== undefined) {
                mappedProp = 'userIdField';
            }
            if (mappedProp === 'assignedTo' && target.assignedToField !== undefined) {
                mappedProp = 'assignedToField';
            }
            if (mappedProp === 'createdBy' && target.createdByField !== undefined) {
                mappedProp = 'createdByField';
            }
            return Reflect.set(target, mappedProp, value, receiver);
        }
    });

    return proxy;
}

class MongooseQuery {
    constructor(sequelizeModel, modelName, type = 'find', query = {}) {
        this.sequelizeModel = sequelizeModel;
        this.modelName = modelName;
        this.type = type;
        this.queryOptions = {
            where: translateQuery(query, sequelizeModel),
            include: [],
            order: [],
            attributes: { exclude: [] }
        };
    }

    sort(sortOption) {
        if (!sortOption) return this;
        let orders = [];
        if (typeof sortOption === 'string') {
            orders = sortOption.split(' ').map(item => {
                if (item.startsWith('-')) {
                    return [item.substring(1), 'DESC'];
                }
                return [item, 'ASC'];
            });
        } else if (typeof sortOption === 'object') {
            orders = Object.entries(sortOption).map(([key, val]) => {
                return [key, val === -1 || val === 'desc' || val === 'DESC' ? 'DESC' : 'ASC'];
            });
        }
        this.queryOptions.order = [...this.queryOptions.order, ...orders];
        return this;
    }

    select(selectOption) {
        if (!selectOption) return this;
        if (typeof selectOption === 'string') {
            const fields = selectOption.split(' ');
            const includes = [];
            const excludes = [];
            fields.forEach(field => {
                if (field.startsWith('-')) {
                    excludes.push(field.substring(1));
                } else if (field) {
                    includes.push(field);
                }
            });
            if (includes.length > 0) {
                this.queryOptions.attributes = includes;
            }
            if (excludes.length > 0) {
                this.queryOptions.attributes = { exclude: excludes };
            }
        } else if (typeof selectOption === 'object') {
            const includes = [];
            const excludes = [];
            Object.entries(selectOption).forEach(([key, val]) => {
                if (val === 0 || val === false) {
                    excludes.push(key);
                } else {
                    includes.push(key);
                }
            });
            if (includes.length > 0) {
                this.queryOptions.attributes = includes;
            }
            if (excludes.length > 0) {
                this.queryOptions.attributes = { exclude: excludes };
            }
        }
        return this;
    }

    populate(path, select) {
        if (!path) return this;
        // In Mongoose: .populate('assignedTo', 'name')
        // In Mongoose nested: .populate({ path: 'employee', populate: { path: 'userId' } })
        let paths = [];
        if (typeof path === 'string') {
            paths = [path];
        } else if (Array.isArray(path)) {
            paths = path;
        } else if (typeof path === 'object') {
            paths = [path];
        }

        paths.forEach(p => {
            let pathName = typeof p === 'string' ? p : p.path;
            let populateSelect = typeof p === 'object' ? p.select : select;
            let nestedPopulate = typeof p === 'object' ? p.populate : null;

            // Handle completions.user nested populates
            if (pathName.includes('.')) {
                // E.g., completions.user -> completions is stored as JSON, so we fetch standard completions and mock in-memory population, or handle it
                return;
            }

            if (pathName === 'customer' && (this.modelName === 'Order' || this.modelName === 'Ticket')) {
                ['Customer', 'Lead'].forEach(modelKey => {
                    const referencedModel = modelRegistry[modelKey];
                    if (referencedModel) {
                        const includeOption = {
                            model: referencedModel.sequelizeModel,
                            as: modelKey
                        };
                        if (populateSelect) {
                            if (typeof populateSelect === 'string') {
                                const fields = populateSelect.split(' ').filter(f => !f.startsWith('-'));
                                const filteredFields = fields.filter(f => {
                                    if (f === 'id' || f === '_id') return true;
                                    return !!referencedModel.sequelizeModel.rawAttributes[f];
                                });
                                if (!filteredFields.includes('id')) {
                                    filteredFields.push('id');
                                }
                                includeOption.attributes = filteredFields;
                            }
                        }
                        this.queryOptions.include.push(includeOption);
                    }
                });
                return;
            }

            // Find matching model association in registry
            let assocName = pathName;
            let referencedModel = null;
            
            if (this.sequelizeModel.associations[assocName]) {
                const assoc = this.sequelizeModel.associations[assocName];
                const targetModelName = assoc.target.name;
                referencedModel = modelRegistry[targetModelName];
            } else {
                // Fallback to match commonly capitalized models
                let matchModelName = pathName.charAt(0).toUpperCase() + pathName.slice(1);
                if (matchModelName.toLowerCase() === 'userid') matchModelName = 'User';
                if (matchModelName === 'Employee') matchModelName = 'Employee';
                referencedModel = modelRegistry[matchModelName];
            }
            if (referencedModel) {
                const includeOption = {
                    model: referencedModel.sequelizeModel,
                    as: assocName
                };

                if (populateSelect) {
                    if (typeof populateSelect === 'string') {
                        const fields = populateSelect.split(' ').filter(f => !f.startsWith('-'));
                        const filteredFields = fields.filter(f => {
                            if (f === 'id' || f === '_id') return true;
                            return !!referencedModel.sequelizeModel.rawAttributes[f];
                        });
                        if (!filteredFields.includes('id')) {
                            filteredFields.push('id');
                        }
                        includeOption.attributes = filteredFields;
                    }
                }

                if (nestedPopulate) {
                    // Simple recursive include for one-level nesting
                    let nestedPath = typeof nestedPopulate === 'string' ? nestedPopulate : nestedPopulate.path;
                    let nestedMatch = nestedPath.charAt(0).toUpperCase() + nestedPath.slice(1);
                    if (nestedMatch.toLowerCase() === 'userid') nestedMatch = 'User';
                    const nestedRef = modelRegistry[nestedMatch];
                    if (nestedRef) {
                        includeOption.include = [{
                            model: nestedRef.sequelizeModel,
                            as: nestedPath
                        }];
                    }
                }

                this.queryOptions.include.push(includeOption);
            }
        });
        return this;
    }

    limit(limitVal) {
        if (limitVal !== undefined) this.queryOptions.limit = limitVal;
        return this;
    }

    skip(skipVal) {
        if (skipVal !== undefined) this.queryOptions.offset = skipVal;
        return this;
    }

    async exec() {
        let result;
        if (this.type === 'find') {
            result = await this.sequelizeModel.findAll(this.queryOptions);
            return result.map(inst => wrapInstance(inst, this.modelName));
        } else if (this.type === 'findOne') {
            result = await this.sequelizeModel.findOne(this.queryOptions);
            return wrapInstance(result, this.modelName);
        } else if (this.type === 'findById') {
            result = await this.sequelizeModel.findByPk(this.queryOptions.where.id, this.queryOptions);
            return wrapInstance(result, this.modelName);
        } else if (this.type === 'count') {
            return await this.sequelizeModel.count(this.queryOptions);
        }
    }

    // Support promise matching (.then / .catch / await)
    then(onFulfilled, onRejected) {
        return this.exec().then(onFulfilled, onRejected);
    }
}

function preprocessData(data, model) {
    if (!data) return data;
    if (Array.isArray(data)) {
        return data.map(item => preprocessData(item, model));
    }
    const preprocessed = {};
    for (let [key, value] of Object.entries(data)) {
        let mappedKey = key === '_id' ? 'id' : key;
        
        // Extract raw ID if it is a bridged instance or object
        if (value && typeof value === 'object') {
            if (value._wrapped) {
                value = value.id;
            } else if (value._id) {
                value = value._id;
            }
        }
        
        if (model && model.rawAttributes) {
            if (!model.rawAttributes[mappedKey]) {
                if (mappedKey === 'customer' && model.rawAttributes['customerModel']) {
                    // Preserve 'customer' so that the beforeValidate hook resolves polymorphic mapping
                } else if (model.rawAttributes[mappedKey + 'Id']) {
                    mappedKey = mappedKey + 'Id';
                } else if (model.rawAttributes[mappedKey + 'Field']) {
                    mappedKey = mappedKey + 'Field';
                }
            }
        }
        preprocessed[mappedKey] = value;
    }
    return preprocessed;
}

function makeBridgedModel(modelName, sequelizeModel) {
    function BridgedModel(data) {
        if (!(this instanceof BridgedModel)) {
            return new BridgedModel(data);
        }
        const processed = preprocessData(data, sequelizeModel);
        const record = sequelizeModel.build(processed);
        if (processed) {
            for (const [k, v] of Object.entries(processed)) {
                if (!sequelizeModel.rawAttributes[k]) {
                    record[k] = v;
                }
            }
        }
        return wrapInstance(record, modelName);
    }

    BridgedModel.sequelizeModel = sequelizeModel;

    BridgedModel.find = function(query = {}) {
        return new MongooseQuery(sequelizeModel, modelName, 'find', query);
    };

    BridgedModel.findOne = function(query = {}) {
        return new MongooseQuery(sequelizeModel, modelName, 'findOne', query);
    };

    BridgedModel.findById = function(id) {
        return new MongooseQuery(sequelizeModel, modelName, 'findById', { _id: id });
    };

    BridgedModel.create = async function(data) {
        if (Array.isArray(data)) {
            return await this.insertMany(data);
        }
        const processed = preprocessData(data, sequelizeModel);
        const record = sequelizeModel.build(processed);
        if (processed) {
            for (const [k, v] of Object.entries(processed)) {
                if (!sequelizeModel.rawAttributes[k]) {
                    record[k] = v;
                }
            }
        }
        await record.save();
        return wrapInstance(record, modelName);
    };

    BridgedModel.findOrCreate = async function(options = {}) {
        const where = translateQuery(options.where, sequelizeModel);
        const defaults = preprocessData(options.defaults || {}, sequelizeModel);
        const [record, created] = await sequelizeModel.findOrCreate({
            where,
            defaults
        });
        return [wrapInstance(record, modelName), created];
    };

    BridgedModel.insertMany = async function(docs) {
        const docArray = Array.isArray(docs) ? docs : [docs];
        const instances = docArray.map(doc => {
            const processed = preprocessData(doc, sequelizeModel);
            const record = sequelizeModel.build(processed);
            if (processed) {
                for (const [k, v] of Object.entries(processed)) {
                    if (!sequelizeModel.rawAttributes[k]) {
                        record[k] = v;
                    }
                }
            }
            return record;
        });
        
        const records = [];
        for (const inst of instances) {
            await inst.save();
            records.push(inst);
        }
        return records.map(r => wrapInstance(r, modelName));
    };

    BridgedModel.deleteMany = async function(query = {}) {
        const where = translateQuery(query, sequelizeModel);
        const count = await sequelizeModel.destroy({ where });
        return { deletedCount: count };
    };

    BridgedModel.countDocuments = async function(query = {}) {
        const where = translateQuery(query, sequelizeModel);
        return await sequelizeModel.count({ where });
    };

    BridgedModel.findByIdAndDelete = async function(id) {
        const record = await sequelizeModel.findByPk(id);
        if (record) {
            await record.destroy();
        }
        return wrapInstance(record, modelName);
    };

    BridgedModel.findByIdAndUpdate = async function(id, updateData, options = {}) {
        const record = await sequelizeModel.findByPk(id);
        if (record) {
            const parsedUpdate = updateData.$set ? updateData.$set : updateData;
            const processed = preprocessData(parsedUpdate, sequelizeModel);
            await record.update(processed);
        }
        return wrapInstance(record, modelName);
    };

    BridgedModel.updateMany = async function(query = {}, updateData) {
        const where = translateQuery(query, sequelizeModel);
        const parsedUpdate = updateData.$set ? updateData.$set : updateData;
        const processed = preprocessData(parsedUpdate, sequelizeModel);
        const [affectedCount] = await sequelizeModel.update(processed, { where });
        return { matchedCount: affectedCount, modifiedCount: affectedCount };
    };

    BridgedModel.aggregate = async function(pipeline) {
        if (!pipeline || !Array.isArray(pipeline)) return [];

        // 1. Order revenue sum
        if (modelName === 'Order' && pipeline.some(stage => stage.$group && stage.$group.total && stage.$group.total.$sum === '$totalAmount')) {
            const matchStage = pipeline.find(stage => stage.$match);
            const rawWhere = matchStage ? matchStage.$match : {};
            const where = translateQuery(rawWhere, sequelizeModel);
            
            const total = await sequelizeModel.sum('totalAmount', { where });
            return [{ _id: null, total: total || 0 }];
        }

        // 2. Order monthly stats (in-memory aggregation)
        if (modelName === 'Order' && pipeline.some(stage => stage.$group && stage.$group._id && stage.$group._id.$month)) {
            const orders = await sequelizeModel.findAll({
                attributes: ['createdAt', 'totalAmount'],
                raw: true
            });
            
            const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const counts = Array.from({ length: 13 }, (_, i) => ({
                _id: i,
                name: months[i],
                sales: 0,
                revenue: 0
            }));

            orders.forEach(o => {
                if (o.createdAt) {
                    const date = new Date(o.createdAt);
                    const month = date.getMonth() + 1; // 1-indexed
                    counts[month].sales += 1;
                    counts[month].revenue += (o.totalAmount || 0);
                }
            });

            return counts.slice(1).filter(m => m.sales > 0);
        }

        // 3. Group count by string field (Material categories, Employee departments, Lead statuses)
        const groupStage = pipeline.find(stage => stage.$group);
        if (groupStage && groupStage.$group && typeof groupStage.$group._id === 'string' && groupStage.$group._id.startsWith('$')) {
            const fieldName = groupStage.$group._id.substring(1);
            const matchStage = pipeline.find(stage => stage.$match);
            const where = matchStage ? translateQuery(matchStage.$match, sequelizeModel) : {};

            let queryField = fieldName === '_id' ? 'id' : fieldName;
            if (sequelizeModel.rawAttributes && !sequelizeModel.rawAttributes[queryField] && sequelizeModel.rawAttributes[queryField + 'Field']) {
                queryField = queryField + 'Field';
            }

            const results = await sequelizeModel.findAll({
                attributes: [
                    [queryField, '_id']
                ],
                where,
                raw: true
            });

            // Group in JavaScript for absolute SQL dialect/driver safety
            const groupCounts = {};
            results.forEach(r => {
                const key = r._id || '';
                groupCounts[key] = (groupCounts[key] || 0) + 1;
            });

            const finalResults = Object.entries(groupCounts).map(([key, val]) => ({
                _id: key,
                value: val
            }));

            if (modelName === 'Lead') {
                return finalResults.map(r => ({ name: r._id, value: r.value }));
            }
            if (modelName === 'Material') {
                return finalResults.map(r => ({ name: r._id || 'Uncategorized', value: r.value }));
            }
            return finalResults;
        }

        return [];
    };

    registerModel(modelName, BridgedModel);
    return BridgedModel;
}

module.exports = {
    makeBridgedModel,
    wrapInstance,
    registerModel
};
