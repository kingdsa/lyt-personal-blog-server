#!/usr/bin/env bash

# 安装所有依赖（包含 devDependencies）
pnpm install --frozen-lockfile

# 运行构建命令
pnpm run build:pro
