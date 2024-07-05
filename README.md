# Sync Printful to Shopify

This project provides a CLI tool to fetch Shopify meta objects, retrieve Printful catalog data by product ID, and update Shopify meta objects with mapped data. Additionally, it can retrieve and display Printful catalog categories and products by category IDs.

## Features

- Sync Shopify meta objects with Printful product data.
- Retrieve and display Printful catalog categories.
- Retrieve and display Printful products by catalog category IDs.

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/SmolSoftBoi/sync-printful-to-shopify.git
cd sync-printful-to-shopify
```

2. **Install dependencies:**

```bash
yarn install
```

3. **Setup Environment Variables:**

Create a `.env` file in the root of your project and add your Shopify and Printful credentials:

```env
SHOPIFY_API_KEY='your-shopify-api-key'
SHOPIFY_API_SECRET='your-shopify-api-secret'
SHOPIFY_STORE_HOST_NAME='your-shopify-store-hostname'
SHOPIFY_ACCESS_TOKEN='your-shopify-access-token'
PRINTFUL_API_KEY='your-printful-api-key'
VENDOR_PRODUCT_METAOBJECT_TYPE='your-metafield-type'
```

## Usage

### Compile TypeScript

I use TypeScript, compile it to JavaScript before running:

```bash
yarn compile
```

### Run the CLI

**Sync Shopify meta objects with Printful product data:**

```bash
yarn start
```

**Retrieve and display Printful catalog categories:**

```bash
yarn start categories
```

**Retrieve and display Printful products by catalog category IDs:**

```bash
yarn start products <categoryIds...>
```

Replace `<categoryIds...>` with the actual category IDs you want to query.

## Development

### Scripts

- **Compile TypeScript:**

  ```bash
  yarn compile
  ```

- **Run GraphQL Codegen:**

  ```bash
  yarn graphql-codegen
  ```

- **Lint and format code:**

  ```bash
  yarn lint
  ```

- **Prepublish:**

  ```bash
  yarn prepublish
  ```

- **Start the project:**

  ```bash
  yarn start
  ```

### Dependencies

- `@shopify/shopify-api`: Shopify API client for Node.js.
- `axios`: Promise-based HTTP client for making API requests.
- `commander`: Command-line interface parser.
- `dotenv`: Loads environment variables from a `.env` file.

### Dev Dependencies

- `@typescript-eslint/eslint-plugin`: Linting TypeScript with ESLint.
- `@typescript-eslint/parser`: ESLint parser for TypeScript.
- `eslint`: Pluggable JavaScript linter.
- `eslint-config-typescript-sort-imports`: ESLint shareable config for sorting imports.
- `eslint-import-resolver-typescript`: TypeScript plugin for eslint-plugin-import.
- `eslint-plugin-import`: ESLint plugin for import/export syntax.
- `typescript`: TypeScript language support.

## Author

Kristian Matthews-Kennington

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
