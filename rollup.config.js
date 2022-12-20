import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import ts from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import typescript from "ttypescript";

export const config = [
  {
    input: "./src/index.ts",
    output: [{
      dir: "./dist/esm",
      format: "esm",
      preserveModules: true,
      sourcemap: true,
      entryFileNames: "[name].mjs"
    }, {
      dir: "./dist/cjs",
      format: "cjs",
      preserveModules: true,
      sourcemap: true,
      entryFileNames: "[name].cjs",
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
  },
  {
    input: "./src/index.test.ts",
    output: [{
      dir: "./dist/test",
      format: "cjs",
      exports: "named",
      preserveModules: true,
      sourcemap: true,
      entryFileNames: "[name].cjs",
    }],
    plugins: [resolve(), ts({ typescript }), commonjs()],
    external: ["react", "tslib", "@hazae41/phobos"]
  },
]

export default config