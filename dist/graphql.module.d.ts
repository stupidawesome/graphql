import {
  DynamicModule,
  HttpServer,
  OnModuleInit,
} from '@nestjs/common/interfaces';
import { ApolloServer } from 'apollo-server-express';
import { GraphQLFactory } from './graphql.factory';
import {
  GqlModuleAsyncOptions,
  GqlModuleOptions,
} from './interfaces/gql-module-options.interface';
export declare class GraphQLModule implements OnModuleInit {
  private httpServer;
  private readonly options;
  private readonly graphQLFactory;
  protected apolloServer: ApolloServer;
  constructor(
    httpServer: HttpServer,
    options: GqlModuleOptions,
    graphQLFactory: GraphQLFactory,
  );
  static forRoot(options?: GqlModuleOptions): DynamicModule;
  static forRootAsync(options: GqlModuleAsyncOptions): DynamicModule;
  private static createAsyncProviders;
  private static createAsyncOptionsProvider;
  onModuleInit(): Promise<void>;
}