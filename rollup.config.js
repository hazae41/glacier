import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import ts from "@rollup/plugin-typescript";
import typescript from "ttypescript";

export const config = [
  {
    input: "./src/index.ts",
    output: [{
      dir: "./dist/mjs",
      format: "esm",
      preserveModules: true,
      entryFileNames: "[name].mjs"
    }, {
      dir: "./dist/cjs",
      format: "cjs",
      preserveModules: true,
      entryFileNames: "[name].cjs",
    }],
    plugins: [resolve(), ts({ typescript, declaration: false }), commonjs()],
    external: ["react", "tslib"]
  }
]

export default config