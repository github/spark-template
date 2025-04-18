import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

export default function createIconImportProxy(): Plugin {
  const packageName = "@phosphor-icons/react";
  const fallbackIcon = "Question";
  const packagePath = "node_modules/@phosphor-icons/react";

  // Cache to avoid redundant filesystem checks
  const existingExportsCache = new Set<string>();
  let hasLoadedExports = false;
  const proxiedImports = new Map<string, string>();

  // Function to load all available exports from the package
  const loadExports = () => {
    if (hasLoadedExports) return;

    try {
      const packageDir = path.resolve(packagePath);
      console.log(
        `[icon-proxy] Checking for exports in directory: ${packageDir}`
      );

      const filesToCheck = [
        path.join(packageDir, "dist", "index.js"),
        path.join(packageDir, "dist", "index.mjs"),
        path.join(packageDir, "dist", "index.d.ts"),
        path.join(packageDir, "index.js"),
        path.join(packageDir, "index.d.ts"),
      ];

      // Find the first file that exists
      const existingFile = filesToCheck.find((file) => fs.existsSync(file));

      if (existingFile) {
        console.log(`[icon-proxy] Found package file: ${existingFile}`);
        const content = fs.readFileSync(existingFile, "utf-8");

        // Extract export names with multiple regex patterns to catch different export styles
        const exportPatterns = [
          /export\s+\{\s*([^}]+)\s*\}/g, // export { Name1, Name2 }
          /export\s+const\s+(\w+)/g, // export const Name
          /export\s+function\s+(\w+)/g, // export function Name
          /export\s+type\s+(\w+)/g, // export type Name
        ];

        exportPatterns.forEach((pattern) => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            if (pattern.source.includes("\\{")) {
              // Multiple exports in braces
              const exports = match[1].split(",").map((e) => {
                const parts = e.trim().split(/\s+as\s+/);
                return parts[parts.length - 1].trim();
              });
              exports.forEach((name) => existingExportsCache.add(name));
            } else {
              // Single export
              existingExportsCache.add(match[1]);
            }
          }
        });

        console.log(
          `[icon-proxy] Loaded ${existingExportsCache.size} exports from ${existingFile}`
        );
      } else {
        console.warn(
          `[icon-proxy] Could not find any index files for ${packageName}`
        );
      }

      hasLoadedExports = true;
    } catch (error) {
      console.error(`[icon-proxy] Error analyzing package exports:`, error);
    }
  };

  return {
    name: "vite-icon-import-proxy",
    enforce: "pre",

    configResolved() {
      loadExports();
    },

    transform(code, id) {
      // Skip if not a JS/TS file or is in node_modules
      if (!/\.(jsx?|tsx?)$/.test(id) || id.includes("node_modules")) {
        return null;
      }

      // Ensure exports are loaded
      if (!hasLoadedExports) {
        loadExports();
      }

      // No need to process files that don't import from our package
      if (!code.includes(packageName)) {
        return null;
      }

      // Regular expression to find imports from the package
      // This matches both these patterns:
      // import { IconA, IconB } from '@phosphor-icons/react';
      // import { IconA as RenamedA, IconB } from '@phosphor-icons/react';
      const importRegex = new RegExp(
        `import\\s+{([^}]+)}\\s+from\\s+['"]${packageName}['"]`,
        "g"
      );

      let match;
      let hasChanges = false;
      let modifiedCode = code;

      // Process each import statement
      while ((match = importRegex.exec(code)) !== null) {
        // Extract the imports section { IconA, IconB as AliasB, ... }
        const importSection = match[1];

        // Split into individual imports and process each
        const imports = importSection
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        let newImports = [...imports];
        let needsQuestion = false;

        // Process each imported icon
        for (let i = 0; i < imports.length; i++) {
          const importItem = imports[i];

          // Handle aliased imports: IconName as AliasName
          const parts = importItem.split(/\s+as\s+/);
          const iconName = parts[0].trim();
          const aliasName = parts.length > 1 ? parts[1].trim() : iconName;

          // Check if this icon exists in the package
          if (!existingExportsCache.has(iconName)) {
            console.log(
              `[icon-proxy] Proxying non-existent icon: ${iconName} -> ${fallbackIcon}`
            );
            proxiedImports.set(iconName, fallbackIcon);

            // Replace with Question as AliasName
            newImports[i] = `${fallbackIcon} as ${aliasName}`;
            needsQuestion = true;
            hasChanges = true;
          }
        }

        // Make sure Question is included if we need it
        if (
          needsQuestion &&
          !imports.some(
            (imp) => imp === fallbackIcon || imp.startsWith(`${fallbackIcon} `)
          )
        ) {
          newImports.push(fallbackIcon);
        }

        // Construct the new import statement
        const originalImport = match[0];
        const newImport = `import { ${newImports.join(
          ", "
        )} } from '${packageName}'`;

        // Replace in the code
        modifiedCode = modifiedCode.replace(originalImport, newImport);
      }

      return hasChanges ? modifiedCode : null;
    },

    // At the end of the build, report which icons were proxied
    closeBundle() {
      if (proxiedImports.size > 0) {
        console.log("\n[icon-proxy] Proxied imports:");
        proxiedImports.forEach((fallback, original) => {
          console.log(`  - "${original}" -> "${fallback}"`);
        });
      }
    },
  };
}
