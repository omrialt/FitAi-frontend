/**
 * Detail routes live under a different prefix than the list they belong to, so
 * an exact path match left the nav with nothing highlighted on every detail
 * screen. This maps a pathname to the nav destination that owns it.
 */
const OWNER_PREFIXES: Array<[string, string]> = [
  ['/training-plans', '/my-trainings'],
  ['/workout/', '/my-trainings'],
  ['/log-meal', '/nutrition-plans'],
];

export const navOwnerFor = (pathname: string): string => {
  for (const [prefix, owner] of OWNER_PREFIXES) {
    if (pathname.startsWith(prefix)) return owner;
  }
  return pathname;
};

export const isNavActive = (itemPath: string, pathname: string): boolean => {
  const owner = navOwnerFor(pathname);
  if (itemPath === '/') return owner === '/';
  return owner === itemPath || owner.startsWith(`${itemPath}/`);
};
