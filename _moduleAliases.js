const path = require('path');
const fs = require('fs');

const basePath = __dirname;

// Read aliases from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(basePath, 'package.json'), 'utf8'));
const aliases = packageJson._moduleAliases || {};

// Resolve all paths relative to the project root
const resolvedAliases = Object.entries(aliases).reduce((acc, [key, value]) => {
  acc[key] = path.resolve(basePath, value);
  return acc;
}, {});

// Export for module-alias
module.exports = resolvedAliases;

// Export for TypeScript path mapping (used in tsconfig.json)
module.exports.getPaths = () => {
  const paths = {};
  Object.entries(aliases).forEach(([key, value]) => {
    paths[`${key}/*`] = [`${value}/*`];
  });
  return paths;
};
