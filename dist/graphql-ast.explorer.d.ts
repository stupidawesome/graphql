import {
  DocumentNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  OperationTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  TypeNode,
  TypeSystemDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import {
  InterfaceDeclaration,
  ParameterDeclarationStructure,
  SourceFile,
} from 'ts-simple-ast';
export declare class GraphQLAstExplorer {
  explore(documentNode: DocumentNode, outputPath: string): SourceFile;
  lookupDefinition(item: TypeSystemDefinitionNode, tsFile: SourceFile): void;
  lookupRootSchemaDefinition(
    operationTypes: OperationTypeDefinitionNode[],
    tsFile: SourceFile,
  ): void;
  addObjectTypeDefinition(
    item:
      | ObjectTypeDefinitionNode
      | InputObjectTypeDefinitionNode
      | InterfaceTypeDefinitionNode,
    tsFile: SourceFile,
  ): void;
  lookupFieldDefiniton(
    item: FieldDefinitionNode | InputValueDefinitionNode,
    tsFile: SourceFile,
    parentRef: InterfaceDeclaration,
  ): void;
  lookupField(
    item: FieldDefinitionNode | InputValueDefinitionNode,
    tsFile: SourceFile,
    parentRef: InterfaceDeclaration,
  ): void;
  getFieldTypeDefinition(
    type: TypeNode,
  ): {
    name: string;
    required: boolean;
  };
  getNestedType(
    type: TypeNode,
  ): {
    type: TypeNode;
    required: boolean;
  };
  getType(typeName: string): string;
  getDefaultTypes(): {
    [type: string]: string;
  };
  getFunctionParameters(
    inputs: InputValueDefinitionNode[],
  ): ParameterDeclarationStructure[];
  addScalarDefinition(item: ScalarTypeDefinitionNode, tsFile: SourceFile): void;
  addExtendInterfaces(
    intefaces: NamedTypeNode[],
    parentRef: InterfaceDeclaration,
  ): void;
  addEnumDefinition(item: EnumTypeDefinitionNode, tsFile: SourceFile): void;
  addUnionDefinition(item: UnionTypeDefinitionNode, tsFile: SourceFile): void;
}
