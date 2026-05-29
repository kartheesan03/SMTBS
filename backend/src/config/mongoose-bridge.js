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
            sequelizeQuery[Op.and].push(
                sequelize.literal(`JSON_CONTAINS(${mappedKey}, '${value}')`)
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
            
            if (prop === 'customer' && (modelName === 'Order' || modelName === 'Ticket')) {
                return target.Customer || target.Lead || null;
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
                                includeOption.attributes = populateSelect.split(' ').filter(f => !f.startsWith('-'));
                            }
                        }
                        this.queryOptions.include.push(includeOption);
                    }
                });
                return;
            }

            // Find matching model association in registry
            let assocName = pathName;
            // Match commonly capitalized models (e.g. employee -> Employee)
            let matchModelName = pathName.charAt(0).toUpperCase() + pathName.slice(1);
            if (matchModelName === 'Userid') matchModelName = 'User';
            if (matchModelName === 'Employee') matchModelName = 'Employee';

            const referencedModel = modelRegistry[matchModelName];
            if (referencedModel) {
                const includeOption = {
                    model: referencedModel.sequelizeModel,
                    as: assocName
                };

                if (populateSelect) {
                    if (typeof populateSelect === 'string') {
                        includeOption.attributes = populateSelect.split(' ').filter(f => !f.startsWith('-'));
                    }
                }

                if (nestedPopulate) {
                    // Simple recursive include for one-level nesting
                    let nestedPath = typeof nestedPopulate === 'string' ? nestedPopulate : nestedPopulate.path;
                    let nestedMatch = nestedPath.charAt(0).toUpperCase() + nestedPath.slice(1);
                    if (nestedMatch === 'Userid') nestedMatch = 'User';
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
                if (model.rawAttributes[mappedKey + 'Id']) {
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
    const bridge = {
        sequelizeModel,
        
        find(query = {}) {
            return new MongooseQuery(sequelizeModel, modelName, 'find', query);
        },

        findOne(query = {}) {
            return new MongooseQuery(sequelizeModel, modelName, 'findOne', query);
        },

        findById(id) {
            return new MongooseQuery(sequelizeModel, modelName, 'findById', { _id: id });
        },

        async create(data) {
            if (Array.isArray(data)) {
                return await this.insertMany(data);
            }
            const processed = preprocessData(data, sequelizeModel);
            const record = await sequelizeModel.create(processed);
            return wrapInstance(record, modelName);
        },

        async insertMany(docs) {
            const processed = preprocessData(docs, sequelizeModel);
            const records = await sequelizeModel.bulkCreate(processed);
            return records.map(r => wrapInstance(r, modelName));
        },

        async deleteMany(query = {}) {
            const where = translateQuery(query, sequelizeModel);
            const count = await sequelizeModel.destroy({ where });
            return { deletedCount: count };
        },

        async countDocuments(query = {}) {
            const where = translateQuery(query, sequelizeModel);
            return await sequelizeModel.count({ where });
        },

        async findByIdAndDelete(id) {
            const record = await sequelizeModel.findByPk(id);
            if (record) {
                await record.destroy();
            }
            return wrapInstance(record, modelName);
        },

        async findByIdAndUpdate(id, updateData, options = {}) {
            const record = await sequelizeModel.findByPk(id);
            if (record) {
                const parsedUpdate = updateData.$set ? updateData.$set : updateData;
                const processed = preprocessData(parsedUpdate, sequelizeModel);
                await record.update(processed);
            }
            return wrapInstance(record, modelName);
        },

        async updateMany(query = {}, updateData) {
            const where = translateQuery(query, sequelizeModel);
            const parsedUpdate = updateData.$set ? updateData.$set : updateData;
            const processed = preprocessData(parsedUpdate, sequelizeModel);
            const [affectedCount] = await sequelizeModel.update(processed, { where });
            return { matchedCount: affectedCount, modifiedCount: affectedCount };
        }
    };

    registerModel(modelName, bridge);
    return bridge;
}

module.exports = {
    makeBridgedModel,
    wrapInstance,
    registerModel
};
