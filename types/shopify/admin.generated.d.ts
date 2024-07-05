/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type GetShopifyMetaobjectsQueryVariables = AdminTypes.Exact<{
  type: AdminTypes.Scalars['String']['input'];
}>;

export type GetShopifyMetaobjectsQuery = {
  metaobjects: {
    edges: Array<{
      node: Pick<AdminTypes.Metaobject, 'id'> & {
        fields: Array<Pick<AdminTypes.MetaobjectField, 'key' | 'value'>>;
      };
    }>;
  };
};

export type UpdateShopifyMetaobjectMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
  metaobject: AdminTypes.MetaobjectUpdateInput;
}>;

export type UpdateShopifyMetaobjectMutation = {
  metaobjectUpdate?: AdminTypes.Maybe<{
    userErrors: Array<
      Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

interface GeneratedQueryTypes {
  '#graphql\n    query getShopifyMetaobjects($type: String!) {\n      metaobjects(first: 100, type: $type) {\n        edges {\n          node {\n            id\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }': {
    return: GetShopifyMetaobjectsQuery;
    variables: GetShopifyMetaobjectsQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n    mutation updateShopifyMetaobject($id: ID!, $metaobject: \n      MetaobjectUpdateInput!) {\n        metaobjectUpdate(id: $id, metaobject: $metaobject) {\n          userErrors {\n            code,\n            field,\n            message\n          }\n        }\n    }': {
    return: UpdateShopifyMetaobjectMutation;
    variables: UpdateShopifyMetaobjectMutationVariables;
  };
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
