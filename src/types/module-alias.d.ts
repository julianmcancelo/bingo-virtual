declare module 'module-alias/register' {
  const register: () => void;
  export = register;
}

declare module 'module-alias' {
  interface ModuleAliasOptions {
    [key: string]: string;
  }

  export function addAliases(aliases: ModuleAliasOptions): void;
  export function isPathMatchesAlias(path: string, alias: string): boolean;
  export function isPathMatchesAliases(path: string, aliases: string[]): boolean;
  export function getAliasValue(alias: string): string | undefined;
  export function getAlias(alias: string): string | undefined;
  export function getAliasList(): Array<{ name: string; path: string }>;
  export function getModulePath(modulePath: string): string;
  export function getModuleRootDir(modulePath: string): string | undefined;
  export function reset(): void;
  
  const moduleAlias: {
    addAliases: typeof addAliases;
    isPathMatchesAlias: typeof isPathMatchesAlias;
    isPathMatchesAliases: typeof isPathMatchesAliases;
    getAliasValue: typeof getAliasValue;
    getAlias: typeof getAlias;
    getAliasList: typeof getAliasList;
    getModulePath: typeof getModulePath;
    getModuleRootDir: typeof getModuleRootDir;
    reset: typeof reset;
  };
  
  export default moduleAlias;
}
