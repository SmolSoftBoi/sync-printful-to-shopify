import '@shopify/shopify-api/adapters/node';
import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
import axios from 'axios';
import dotenv from 'dotenv';
import { Command } from 'commander';
import {
  GetShopifyMetaobjectsQuery,
  UpdateShopifyMetaobjectMutation,
} from './types/shopify/admin.generated';
import {
  Metaobject,
  MetaobjectField,
  MetaobjectUpdateInput,
} from './types/shopify/admin.types';

dotenv.config();

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOPIFY_STORE_HOST_NAME,
  SHOPIFY_ACCESS_TOKEN,
  PRINTFUL_API_KEY,
} = process.env;
const PRINTFUL_API_URL = 'https://api.printful.com';
const VENDOR_PRODUCT_METAOBJECT_TYPE =
  process.env.VENDOR_PRODUCT_METAOBJECT_TYPE || 'vendor_product';

interface PrintfulProduct {
  id: number;
  name: string;
  type: string;
  brand: string;
}

interface PrintfulCategory {
  id: number;
  title: string;
}

const shopify = shopifyApi({
  apiKey: SHOPIFY_API_KEY || '',
  apiVersion: ApiVersion.July24,
  isCustomStoreApp: true,
  adminApiAccessToken: SHOPIFY_ACCESS_TOKEN || '',
  isEmbeddedApp: false,
  hostName: SHOPIFY_STORE_HOST_NAME || '',
  apiSecretKey: SHOPIFY_API_SECRET || '',
  scopes: ['read_products'],
});

const session = shopify.session.customAppSession(SHOPIFY_STORE_HOST_NAME || '');

const shopifyClient = new shopify.clients.Graphql({ session });

const getShopifyMetaobjects = async (): Promise<
  (Pick<Metaobject, 'id'> & {
    fields: Array<Pick<MetaobjectField, 'key' | 'value'>>;
  })[]
> => {
  const response = await shopifyClient.request<GetShopifyMetaobjectsQuery>(
    `#graphql
    query getShopifyMetaobjects($type: String!) {
      metaobjects(first: 100, type: $type) {
        edges {
          node {
            id
            fields {
              key
              value
            }
          }
        }
      }
    }`,
    {
      variables: {
        type: VENDOR_PRODUCT_METAOBJECT_TYPE,
      },
    }
  );
  return response.data?.metaobjects.edges.map((edge) => edge.node) || [];
};

const getPrintfulProductData = async (
  productId: string
): Promise<PrintfulProduct> => {
  const response = await axios.get<{ data: PrintfulProduct }>(
    `${PRINTFUL_API_URL}/v2/catalog-products/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    }
  );
  return response.data.data;
};

const getPrintfulCategories = async (): Promise<PrintfulCategory[]> => {
  const categories: PrintfulCategory[] = [];

  const fetchCategories = async (url: string | null): Promise<void> => {
    if (!url) {
      return;
    }

    const response = await axios.get<{
      data: PrintfulCategory[];
      _links: { next?: { href: string } };
    }>(url, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    });
    categories.push(...response.data.data);

    const nextLink = response.data._links.next?.href;
    if (nextLink) {
      await fetchCategories(nextLink);
    }
  };

  await fetchCategories(`${PRINTFUL_API_URL}/v2/catalog-categories`);

  return categories;
};

const getPrintfulProductsByCategoryIds = async (
  categoryIds: string[]
): Promise<PrintfulProduct[]> => {
  const products: PrintfulProduct[] = [];

  const fetchProducts = async (url: string | null) => {
    if (!url) {
      return;
    }

    const response = await axios.get<{
      data: PrintfulProduct[];
      _links: { next?: { href: string } };
    }>(url, {
      params: {
        category_ids: categoryIds.join(','),
      },
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    });
    products.push(...response.data.data);

    const nextLink = response.data._links.next?.href;
    if (nextLink) {
      await fetchProducts(nextLink);
    }
  };

  await fetchProducts(`${PRINTFUL_API_URL}/v2/catalog-products`);

  return products;
};

const updateShopifyMetaobject = async (
  id: string,
  metaobject: MetaobjectUpdateInput
): Promise<void> => {
  const response = await shopifyClient.request<UpdateShopifyMetaobjectMutation>(
    `#graphql
    mutation updateShopifyMetaobject($id: ID!, $metaobject: 
      MetaobjectUpdateInput!) {
        metaobjectUpdate(id: $id, metaobject: $metaobject) {
          userErrors {
            code,
            field,
            message
          }
        }
    }`,
    {
      variables: {
        id: id,
        metaobject: metaobject,
      },
    }
  );

  if (response.data?.metaobjectUpdate?.userErrors) {
    console.error(response.data.metaobjectUpdate.userErrors);
    throw new Error(
      response.data.metaobjectUpdate.userErrors
        .map((error) => error.message)
        .join(', ')
    );
  }
};

const mapPrintfulProductToShopifyMetaobject = (
  printfulProduct: PrintfulProduct
): MetaobjectUpdateInput => {
  return {
    fields: [
      {
        key: 'title',
        value: printfulProduct.name.replace('|', '-'),
      },
      {
        key: 'vendor',
        value: printfulProduct.brand,
      },
    ],
  };
};

const main = async () => {
  try {
    const shopifyMetaobjects = await getShopifyMetaobjects();

    for (const shopifyMetaobject of shopifyMetaobjects) {
      const printfulProductId = shopifyMetaobject.fields.find(
        (field) => field.key === 'vendor_id'
      )?.value;

      if (!printfulProductId) {
        continue;
      }

      const printfulData = await getPrintfulProductData(printfulProductId);
      const updatedShopifyMetaobjectData =
        mapPrintfulProductToShopifyMetaobject(printfulData);

      console.log(
        'Updating Shopify metaobject data:',
        updatedShopifyMetaobjectData
      );

      for (const field of updatedShopifyMetaobjectData.fields || []) {
        console.log(field.key, field.value);
      }

      await updateShopifyMetaobject(
        shopifyMetaobject.id,
        updatedShopifyMetaobjectData
      );

      console.log(
        `Updated metaobject ID ${shopifyMetaobject.id} with Printful data.`
      );
    }
  } catch (error) {
    console.error('Error updating Shopify metaobjects:', error);
  }
};

const displayPrintfulCategories = async () => {
  try {
    const categories = await getPrintfulCategories();

    for (const category of categories) {
      console.log(category.title);
      console.log('ID', category.id);
    }
  } catch (error) {
    console.error('Error retrieving Printful categories:', error);
  }
};

const displayPrintfulProductsByCategoryIds = async (categoryIds: string[]) => {
  try {
    const products = await getPrintfulProductsByCategoryIds(categoryIds);
    products.forEach((product) => {
      console.log(product.name);
      console.log('ID', product.id);
    });
  } catch (error) {
    console.error('Error retrieving Printful products:', error);
  }
};

const program = new Command();
program
  .name('shopify-printful-sync')
  .description('CLI to sync Shopify metaobjects with Printful product data.')
  .version('1.0.0')
  .action(main);

program
  .command('categories')
  .description('Retrieve and display Printful catalog categories.')
  .action(displayPrintfulCategories);

program
  .command('products <categoryIds...>')
  .description(
    'Retrieve and display Printful products by catalog category IDs.'
  )
  .action(displayPrintfulProductsByCategoryIds);

program.parse(process.argv);
