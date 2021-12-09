import { expect, test } from "@jest/globals";
import { build } from "esbuild";
import { join } from "path";
import plugin from "./index";

test("esbuild-plugin-node-externals", async () => {
  const result = await build({
    stdin: {
      contents: `
        import path from "path";
        import plugin from "./index"
        console.log(path, plugin);
      `,
      resolveDir: join(process.cwd(), "src"),
    },
    write: false,
    bundle: true,
    format: "esm",
    plugins: [plugin()],
  });
  expect(result.outputFiles[0].text).toMatchInlineSnapshot(`
    "// <stdin>
    import path from \\"path\\";

    // src/index.ts
    var src_default = ({ filter = /^[@\\\\w]/ } = {}) => ({
      name: \\"node-externals\\",
      setup(build) {
        build.onResolve({ filter }, (args) => {
          return { external: args.kind !== \\"entry-point\\" };
        });
      }
    });

    // <stdin>
    console.log(path, src_default);
    "
  `);
});
