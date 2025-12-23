import fs from 'fs';

import path from 'path';

(() => {
  const r = fs.readFileSync('./registry.json', 'utf-8');

  console.log(JSON.parse(r).items);
  const newItems = JSON.parse(r).items.map((item: any) => {
    const newDeps = item?.registryDependencies?.map((dep: string) => {
      if (dep.startsWith('http')) {
        return dep;
      }
      return `https://shadcn-ahooks.vercel.app/r/${dep}.json`;
    });
    return {
      ...item,
      registryDependencies: newDeps,
    };
  });

  const newRegistry = {
    ...JSON.parse(r),
    items: newItems,
  };

  fs.writeFileSync('./registry.json', JSON.stringify(newRegistry, null, 2), 'utf-8');
})()
