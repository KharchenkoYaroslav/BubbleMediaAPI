import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthResolver } from './resolvers/auth.resolver';
import { ProfileResolver } from './resolvers/profile.resolver';
import { ContentResolver } from './resolvers/content.resolver';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { MetricsResolver } from './resolvers/metrics.resolver';
import { CommentResolver } from './resolvers/comment.resolver';
import { ContentFeedResolver } from './resolvers/content-feed.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      csrfPrevention: false,
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, 'proto/auth.proto'),
          url: `${process.env.AUTH_SERVICE_URL || '0.0.0.0:3001'}`,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'PROFILE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'profile',
          protoPath: join(__dirname, 'proto/profile.proto'),
          url: `${process.env.PROFILE_SERVICE_URL || '0.0.0.0:3003'}`,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'CONTENT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'content',
          protoPath: join(__dirname, 'proto/content.proto'),
          url: `${process.env.CONTENT_SERVICE_URL || '0.0.0.0:3004'}`,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'METRICS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'metrics',
          protoPath: join(__dirname, 'proto/metrics.proto'),
          url: `${process.env.METRICS_SERVICE_URL || '0.0.0.0:3005'}`,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'COMMENT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'comment',
          protoPath: join(__dirname, 'proto/comment.proto'),
          url: `${process.env.COMMENT_SERVICE_URL || '0.0.0.0:3006'}`,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'CONTENT_FEED_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'contentfeed',
          protoPath: join(__dirname, 'proto/content-feed.proto'),
          url: `${process.env.CONTENT_FEED_SERVICE_URL || '0.0.0.0:3007'}`,
        },
      },
    ]),
  ],
  providers: [AuthResolver, ProfileResolver, GqlAuthGuard, ContentResolver, MetricsResolver, CommentResolver, ContentFeedResolver],
  exports: [GqlAuthGuard],
})
export class AppModule {}
