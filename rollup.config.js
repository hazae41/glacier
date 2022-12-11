import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import ts from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import typescript from "ttypescript";

export const config = [
  {
    input: "./src/index.ts",
    output: [{
      dir: "./dist/mjs",
      format: "esm",
      preserveModules: true,
      sourcemap: true,
      entryFileNames: "[name].js"
    }, {
      dir: "./dist/cjs",
      format: "cjs",
      preserveModules: true,
      sourcemap: true,
      entryFileNames: "[name].js",
    }],
    plugins: [resolve(), ts({ typescript }), commonjs()],
    external: ["react", "tslib"]
  },
  {
    input: "./src/index.ts",
    output: [{
      dir: "./dist/types",
      format: "esm",
      preserveModules: true,
      entryFileNames: "[name].d.ts",
    }],
    plugins: [dts(), resolve(), ts({ typescript })],
    external: ["react", "tslib"]
  }
]

export default config