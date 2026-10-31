if (!/pnpm/.test(process.env.npm_execpath || '')) {
  console.warn('\u001b[33m[!] 本项目强制使用 pnpm 作为包管理器\u001b[39m\n')
  process.exit(1)
}
