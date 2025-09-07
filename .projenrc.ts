import { javascript } from "projen";
import { monorepo } from "@aws/pdk";

const project = new monorepo.MonorepoTsProject({
  devDeps: ["@aws/pdk"],
  name: "kiro hackathon-mad-mall",
  packageManager: javascript.NodePackageManager.PNPM,
  projenrcTs: true,
  
  // Configure pnpm workspace settings
  pnpmVersion: "10",
  
  // Add workspace scripts for development
  scripts: {
    "dev": "nx run-many --target=dev --all --parallel",
    "build:all": "nx run-many --target=build --all",
    "test:all": "nx run-many --target=test --all",
    "lint:all": "nx run-many --target=lint --all",
    "clean": "nx reset && pnpm exec projen clobber",
    "setup": "pnpm install && pnpm build:all",
    "affected:build": "nx affected --target=build",
    "affected:test": "nx affected --target=test",
    "affected:lint": "nx affected --target=lint",
  },
});

// Enhanced Nx configuration for build caching and task orchestration
project.tryFindObjectFile("nx.json")?.addOverride("tasksRunnerOptions", {
  default: {
    runner: "nx/tasks-runners/default",
    options: {
      useDaemonProcess: true,
      cacheableOperations: ["build", "test", "lint", "typecheck", "package"],
      parallel: 3,
    }
  }
});

project.tryFindObjectFile("nx.json")?.addOverride("targetDefaults", {
  build: {
    inputs: ["default", "^default"],
    outputs: [
      "{projectRoot}/dist",
      "{projectRoot}/lib", 
      "{projectRoot}/build",
      "{projectRoot}/coverage",
      "{projectRoot}/test-reports",
      "{projectRoot}/target",
      "{projectRoot}/cdk.out",
      "{projectRoot}/LICENSE_THIRD_PARTY",
      "{projectRoot}/.jsii"
    ],
    dependsOn: ["^build"]
  },
  test: {
    inputs: ["default", "^default"],
    outputs: ["{projectRoot}/coverage", "{projectRoot}/test-reports"],
    dependsOn: ["build"]
  },
  lint: {
    inputs: ["default"],
    outputs: []
  },
  typecheck: {
    inputs: ["default", "^default"],
    outputs: []
  }
});

// Configure pnpm workspace packages
project.package.addField("workspaces", {
  packages: ["packages/*"]
});

// Add pnpm configuration for better dependency management
project.package.addField("pnpm", {
  ...project.package.manifest.pnpm,
  overrides: {
    ...project.package.manifest.pnpm?.overrides,
    "@types/babel__traverse": "7.18.2",
    "@zkochan/js-yaml": "npm:js-yaml@4.1.0",
    "wrap-ansi": "^7.0.0"
  },
  // Enable hoisting and caching for better performance
  shamefullyHoist: false,
  strictPeerDependencies: false,
  autoInstallPeers: true,
  // Enable pnpm workspaces
  workspaces: {
    packages: ["packages/*"]
  },
  // Add caching configuration
  storeDir: "node_modules/.pnpm",
  cacheDir: "node_modules/.pnpm/cache",
});

// Ensure workspace packages are properly configured
const workspaceFile = project.tryFindObjectFile('pnpm-workspace.yaml');
if (workspaceFile) {
  workspaceFile.addOverride('packages', ['packages/*']);
}

project.synth();