"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const ts_simple_ast_1 = require("ts-simple-ast");
let GraphQLAstExplorer = class GraphQLAstExplorer {
    explore(documentNode, outputPath) {
        if (!documentNode) {
            return;
        }
        const { definitions } = documentNode;
        const tsAstHelper = new ts_simple_ast_1.default();
        const tsFile = tsAstHelper.createSourceFile(outputPath, '', {
            overwrite: true,
        });
        definitions.forEach(item => this.lookupDefinition(item, tsFile));
        return tsFile;
    }
    lookupDefinition(item, tsFile) {
        switch (item.kind) {
            case 'SchemaDefinition':
                return this.lookupRootSchemaDefinition(item.operationTypes, tsFile);
            case 'ObjectTypeDefinition':
            case 'InputObjectTypeDefinition':
            case 'InterfaceTypeDefinition':
                return this.addObjectTypeDefinition(item, tsFile);
            case 'ScalarTypeDefinition':
                return this.addScalarDefinition(item, tsFile);
            case 'EnumTypeDefinition':
                return this.addEnumDefinition(item, tsFile);
            case 'UnionTypeDefinition':
                return this.addUnionDefinition(item, tsFile);
        }
    }
    lookupRootSchemaDefinition(operationTypes, tsFile) {
        const rootInterface = tsFile.addInterface({
            name: 'GqlSchema',
            isExported: true,
        });
        operationTypes.forEach(item => {
            if (!item) {
                return;
            }
            const tempOperationName = item.operation;
            const typeName = lodash_1.get(item, 'type.name.value');
            const interfaceName = typeName || tempOperationName;
            const interfaceRef = tsFile.addInterface({
                name: lodash_1.upperFirst(interfaceName),
                isExported: true,
            });
            rootInterface.addProperty({
                name: interfaceName,
                type: interfaceRef.getName(),
            });
        });
    }
    addObjectTypeDefinition(item, tsFile) {
        const parentName = lodash_1.get(item, 'name.value');
        if (!parentName) {
            return;
        }
        let parentRef = tsFile.getInterface(parentName);
        if (!parentRef) {
            parentRef = tsFile.addInterface({
                name: lodash_1.upperFirst(parentName),
                isExported: true,
            });
        }
        const interfaces = lodash_1.get(item, 'interfaces');
        if (interfaces) {
            this.addExtendInterfaces(interfaces, parentRef);
        }
        (item.fields || []).forEach(element => {
            this.lookupFieldDefiniton(element, tsFile, parentRef);
        });
    }
    lookupFieldDefiniton(item, tsFile, parentRef) {
        switch (item.kind) {
            case 'FieldDefinition':
            case 'InputValueDefinition':
                return this.lookupField(item, tsFile, parentRef);
        }
    }
    lookupField(item, tsFile, parentRef) {
        const propertyName = lodash_1.get(item, 'name.value');
        if (!propertyName) {
            return;
        }
        const isFunction = item.arguments &&
            !lodash_1.isEmpty(item.arguments);
        const { name: type, required } = this.getFieldTypeDefinition(item.type);
        if (!isFunction) {
            parentRef.addProperty({
                name: propertyName,
                type,
                hasQuestionToken: !required,
            });
            return;
        }
        parentRef.addMethod({
            name: propertyName,
            returnType: type,
            parameters: this.getFunctionParameters(item.arguments),
        });
    }
    getFieldTypeDefinition(type) {
        const { required, type: nestedType } = this.getNestedType(type);
        type = nestedType;
        const isArray = type.kind === 'ListType';
        if (isArray) {
            const { required, type: nestedType } = this.getNestedType(lodash_1.get(type, 'type'));
            type = nestedType;
            const typeName = lodash_1.get(type, 'name.value');
            return {
                name: this.getType(typeName) + '[]',
                required,
            };
        }
        const typeName = lodash_1.get(type, 'name.value');
        return {
            name: this.getType(typeName),
            required,
        };
    }
    getNestedType(type) {
        const isNonNullType = type.kind === 'NonNullType';
        if (isNonNullType) {
            return {
                type: this.getNestedType(lodash_1.get(type, 'type')).type,
                required: isNonNullType,
            };
        }
        return { type, required: false };
    }
    getType(typeName) {
        const defaults = this.getDefaultTypes();
        const isDefault = defaults[typeName];
        return isDefault ? defaults[typeName] : typeName;
    }
    getDefaultTypes() {
        return {
            String: 'string',
            Int: 'number',
            Boolean: 'boolean',
            ID: 'string',
            Float: 'number',
        };
    }
    getFunctionParameters(inputs) {
        return inputs.map(element => {
            const { name, required } = this.getFieldTypeDefinition(element.type);
            return {
                name: lodash_1.get(element, 'name.value'),
                type: name,
                hasQuestionToken: !required,
            };
        });
    }
    addScalarDefinition(item, tsFile) {
        const name = lodash_1.get(item, 'name.value');
        if (!name) {
            return;
        }
        tsFile.addTypeAlias({
            name,
            type: 'any',
            isExported: true,
        });
    }
    addExtendInterfaces(intefaces, parentRef) {
        if (!intefaces) {
            return;
        }
        intefaces.forEach(element => {
            const interfaceName = lodash_1.get(element, 'name.value');
            if (interfaceName) {
                parentRef.addExtends(interfaceName);
            }
        });
    }
    addEnumDefinition(item, tsFile) {
        const name = lodash_1.get(item, 'name.value');
        if (!name) {
            return;
        }
        const members = lodash_1.map(item.values, value => ({
            name: lodash_1.get(value, 'name.value'),
            value: lodash_1.get(value, 'name.value'),
        }));
        tsFile.addEnum({
            name,
            members,
            isExported: true,
        });
    }
    addUnionDefinition(item, tsFile) {
        const name = lodash_1.get(item, 'name.value');
        if (!name) {
            return;
        }
        const types = lodash_1.map(item.types, value => lodash_1.get(value, 'name.value'));
        tsFile.addTypeAlias({
            name,
            type: types.join(' | '),
            isExported: true,
        });
    }
};
GraphQLAstExplorer = __decorate([
    common_1.Injectable()
], GraphQLAstExplorer);
exports.GraphQLAstExplorer = GraphQLAstExplorer;
