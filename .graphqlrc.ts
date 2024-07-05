import { ApiType, pluckConfig, preset } from '@shopify/api-codegen-preset';

export default {
  // For syntax highlighting / auto-complete when writing operations
  schema: 'https://shopify.dev/admin-graphql-direct-proxy/2024-07',
  documents: ['./index.{js,ts,jsx,tsx}'],
  projects: {
    default: {
      // For type extraction
      schema: 'https://shopify.dev/admin-graphql-direct-proxy/2024-07',
      documents: ['./index.{js,ts,jsx,tsx}'],
      extensions: {
        codegen: {
          // Enables support for `#graphql` tags, as well as `/* GraphQL */`
          pluckConfig,
          generates: {
            './types/shopify/admin.schema.json': {
              plugins: ['introspection'],
              config: { minify: true },
            },
            './types/shopify/admin.types.d.ts': {
              plugins: ['typescript'],
            },
            './types/shopify/admin.generated.d.ts': {
              preset,
              presetConfig: {
                apiType: ApiType.Admin,
              },
            },
          },
        },
      },
    },
  },
  declarations: true,
};
