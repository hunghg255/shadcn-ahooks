import fs from 'fs';

(() => {
  const r = fs.readFileSync('./registry.json', 'utf-8');

  const registryDependencies = JSON.parse(r).items.map((item: any) => {
    return `https://shadcn-ahooks.vercel.app/r/${item.name}.json`;
  });

  const newRegistry = {
    "$schema": "https://ui.shadcn.com/schema/registry-item.json",
    "name": "shadcn-ahooks",
    "title": "shadcn-ahooks",
    "description": "shadcn-ahooks",
    "registryDependencies": registryDependencies,
    "files": [],
    "type": "registry:hook"
  };

  fs.writeFileSync('./public/shadcn-ahooks.json', JSON.stringify(newRegistry, null, 2), 'utf-8');
})()
