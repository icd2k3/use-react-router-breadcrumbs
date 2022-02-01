/**
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This script exports a hook that accepts a routes array of objects
 * and an options object.
 *
 * API:
 *
 * useBreadcrumbs(
 *   routes?: Array<Route>,
 *   options? Object<Options>,
 * ): Array<BreadcrumbData>
 *
 * More Info:
 *
 * https://github.com/icd2k3/use-react-router-breadcrumbs
 *
 */
import React, { createElement } from 'react';
import {
  matchPath,
  useLocation,
  RouteObject,
  Params,
  PathPattern,
} from 'react-router';

type Location = ReturnType<typeof useLocation>;

export interface Options {
  disableDefaults?: boolean;
  excludePaths?: string[];
  defaultFormatter?: (str: string) => string
}

export interface BreadcrumbMatch<ParamKey extends string = string> {
  /**
   * The names and values of dynamic parameters in the URL.
   */
  params: Params<ParamKey>;
  /**
   * The portion of the URL pathname that was matched.
   */
  pathname: string;
  /**
   * The pattern that was used to match.
   */
  pattern: PathPattern;
  /**
   * The route object that was used to match.
   */
  route?: BreadcrumbsRoute;
}

export interface BreadcrumbComponentProps<ParamKey extends string = string> {
  key: string;
  match: BreadcrumbMatch<ParamKey>;
  location: Location;
}

export type BreadcrumbComponentType<ParamKey extends string = string> =
  React.ComponentType<BreadcrumbComponentProps<ParamKey>>;

export interface BreadcrumbsRoute<ParamKey extends string = string>
  extends RouteObject {
  children?: BreadcrumbsRoute[];
  breadcrumb?: BreadcrumbComponentType<ParamKey> | string | null;
  props?: { [x: string]: unknown };
}

export interface BreadcrumbData<ParamKey extends string = string> {
  match: BreadcrumbMatch<ParamKey>;
  location: Location;
  key: string;
  breadcrumb: React.ReactNode;
}

// The code below is modified from React Router
interface BreadcrumbsRouteMeta {
  relativePath: string;
  childrenIndex: number;
  route: BreadcrumbsRoute;
}

interface BreadcrumbsRouteBranch {
  path: string;
  score: number;
  routesMeta: BreadcrumbsRouteMeta[];
}

const joinPaths = (paths: string[]): string => paths.join('/').replace(/\/\/+/g, '/');

const paramRe = /^:\w+$/;
const dynamicSegmentValue = 3;
const indexRouteValue = 2;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
const splatPenalty = -2;
const isSplat = (s: string) => s === '*';

function computeScore(path: string, index: boolean | undefined): number {
  const segments = path.split('/');
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }

  if (index) {
    initialScore += indexRouteValue;
  }

  return segments
    .filter((s) => !isSplat(s))
    .reduce((score, segment) => {
      if (paramRe.test(segment)) {
        return score + dynamicSegmentValue;
      }
      if (segment === '') {
        return score + emptySegmentValue;
      }
      return score + staticSegmentValue;
    }, initialScore);
}

function compareIndexes(a: number[], b: number[]): number {
  const siblings = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
  return siblings ? a[a.length - 1] - b[b.length - 1] : 0;
}

function flattenRoutes(
  routes: BreadcrumbsRoute[],
  branches: BreadcrumbsRouteBranch[] = [],
  parentsMeta: BreadcrumbsRouteMeta[] = [],
  parentPath = '',
): BreadcrumbsRouteBranch[] {
  routes.forEach((route, index) => {
    if (typeof route.path !== 'string' && !route.index && !route.children?.length) {
      throw new Error(
        'useBreadcrumbs: `path` or `index` must be provided in every route object',
      );
    }
    if (route.path && route.index) {
      throw new Error(
        'useBreadcrumbs: `path` and `index` cannot be provided at the same time',
      );
    }
    const meta: BreadcrumbsRouteMeta = {
      relativePath: route.path || '',
      childrenIndex: index,
      route,
    };

    if (meta.relativePath.charAt(0) === '/') {
      if (!meta.relativePath.startsWith(parentPath)) {
        throw new Error(
          'useBreadcrumbs: The absolute path of the child route must start with the parent path',
        );
      }
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }

    const path = joinPaths([parentPath, meta.relativePath]);
    const routesMeta = parentsMeta.concat(meta);

    if (route.children && route.children.length > 0) {
      if (route.index) {
        throw new Error('useBreadcrumbs: Index route cannot have child routes');
      }
      flattenRoutes(route.children, branches, routesMeta, path);
    }

    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta,
    });
  });
  return branches;
}

function rankRouteBranches(
  branches: BreadcrumbsRouteBranch[],
): BreadcrumbsRouteBranch[] {
  return branches.sort((a, b) => (a.score !== b.score
    ? b.score - a.score // Higher score first
    : compareIndexes(
      a.routesMeta.map((meta) => meta.childrenIndex),
      b.routesMeta.map((meta) => meta.childrenIndex),
    )));
}

// Begin: useBreadcrumbs
const NO_BREADCRUMB = Symbol('NO_BREADCRUMB');

/**
 * This method was "borrowed" from https://stackoverflow.com/a/28339742
 * we used to use the humanize-string package, but it added a lot of bundle
 * size and issues with compilation. This 4-liner seems to cover most cases.
 */
export const humanize = (str: string): string => str
  .replace(/^[\s_]+|[\s_]+$/g, '')
  .replace(/[-_\s]+/g, ' ')
  .replace(/^[a-z]/, (m) => m.toUpperCase());

/**
 * Renders and returns the breadcrumb complete
 * with `match`, `location`, and `key` props.
 */
const render = ({
  breadcrumb: Breadcrumb,
  match,
  location,
  props,
}: {
  breadcrumb: BreadcrumbComponentType | string;
  match: BreadcrumbMatch;
  location: Location;
  props?: { [x: string]: unknown };
}): BreadcrumbData => {
  const componentProps = {
    match,
    location,
    key: match.pathname,
    ...(props || {}),
  };

  return {
    ...componentProps,
    breadcrumb:
      typeof Breadcrumb === 'string' ? (
        createElement('span', { key: componentProps.key }, Breadcrumb)
      ) : (
        <Breadcrumb {...componentProps} />
      ),
  };
};

/**
 * Small helper method to get a default breadcrumb if the user hasn't provided one.
 */
const getDefaultBreadcrumb = ({
  currentSection,
  location,
  pathSection,
  defaultFormatter,
}: {
  currentSection: string;
  location: Location;
  pathSection: string;
  defaultFormatter?: (str: string) => string
}): BreadcrumbData => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const match = matchPath(
    {
      end: true,
      path: pathSection,
    },
    pathSection,
  )!;

  return render({
    breadcrumb: defaultFormatter ? defaultFormatter(currentSection) : humanize(currentSection),
    match,
    location,
  });
};

/**
 * Loops through the route array (if provided) and returns either a
 * user-provided breadcrumb OR a sensible default (if enabled)
 */
const getBreadcrumbMatch = ({
  currentSection,
  disableDefaults,
  excludePaths,
  defaultFormatter,
  location,
  pathSection,
  branches,
}: {
  currentSection: string;
  disableDefaults?: boolean;
  excludePaths?: string[];
  defaultFormatter?: (str: string) => string
  location: Location;
  pathSection: string;
  branches: BreadcrumbsRouteBranch[];
}): typeof NO_BREADCRUMB | BreadcrumbData => {
  let breadcrumb: BreadcrumbData | typeof NO_BREADCRUMB | undefined;

  // Check the optional `excludePaths` option in `options` to see if the
  // current path should not include a breadcrumb.
  const getIsPathExcluded = (path: string): boolean => matchPath(
    {
      path,
      end: true,
    },
    pathSection,
  ) != null;

  if (excludePaths && excludePaths.some(getIsPathExcluded)) {
    return NO_BREADCRUMB;
  }

  // Loop through the route array and see if the user has provided a custom breadcrumb.
  branches.some(({ path, routesMeta }) => {
    const { route } = routesMeta[routesMeta.length - 1];
    let userProvidedBreadcrumb = route.breadcrumb;
    // If the route is an index, but no breadcrumb is set,
    // We try to use the breadcrumbs of the parent route instead
    if (!userProvidedBreadcrumb && route.index) {
      const parentMeta = routesMeta[routesMeta.length - 2];
      if (parentMeta && parentMeta.route.breadcrumb) {
        userProvidedBreadcrumb = parentMeta.route.breadcrumb;
      }
    }

    const { caseSensitive, props } = route;
    const match = matchPath(
      {
        path,
        end: true,
        caseSensitive,
      },
      pathSection,
    );

    // If user passed breadcrumb: null
    // we need to know NOT to add it to the matches array
    // see: `if (breadcrumb !== NO_BREADCRUMB)` below.
    if (match && userProvidedBreadcrumb === null) {
      breadcrumb = NO_BREADCRUMB;
      return true;
    }

    if (match) {
      // This covers the case where a user may be extending their react-router route
      // config with breadcrumbs, but also does not want default breadcrumbs to be
      // automatically generated (opt-in).
      if (!userProvidedBreadcrumb && disableDefaults) {
        breadcrumb = NO_BREADCRUMB;
        return true;
      }

      breadcrumb = render({
        // Although we have a match, the user may be passing their react-router config object
        // which we support. The route config object may not have a `breadcrumb` param specified.
        // If this is the case, we should provide a default via `humanize`.
        breadcrumb: userProvidedBreadcrumb
        || (defaultFormatter ? defaultFormatter(currentSection) : humanize(currentSection)),
        match: { ...match, route },
        location,
        props,
      });
      return true;
    }
    return false;
  });

  // User provided a breadcrumb prop, or we generated one above.
  if (breadcrumb) {
    return breadcrumb;
  }

  // If there was no breadcrumb provided and user has disableDefaults turned on.
  if (disableDefaults) {
    return NO_BREADCRUMB;
  }

  // If the above conditionals don't fire, generate a default breadcrumb based on the path.
  return getDefaultBreadcrumb({
    pathSection,
    // include a "Home" breadcrumb by default (can be overrode or disabled in config).
    currentSection: pathSection === '/' ? 'Home' : currentSection,
    location,
    defaultFormatter,
  });
};

/**
 * Splits the pathname into sections, then search for matches in the routes
 * a user-provided breadcrumb OR a sensible default.
 */
export const getBreadcrumbs = ({
  routes,
  location,
  options = {},
}: {
  routes: BreadcrumbsRoute[];
  location: Location;
  options?: Options;
}): BreadcrumbData[] => {
  const { pathname } = location;

  const branches = rankRouteBranches(flattenRoutes(routes));
  const breadcrumbs: BreadcrumbData[] = [];
  pathname
    .split('?')[0]
    .split('/')
    .reduce(
      (previousSection: string, currentSection: string, index: number) => {
        // Combine the last route section with the currentSection.
        // For example, `pathname = /1/2/3` results in match checks for
        // `/1`, `/1/2`, `/1/2/3`.
        const pathSection = !currentSection
          ? '/'
          : `${previousSection}/${currentSection}`;

        // Ignore trailing slash or double slashes in the URL
        if (pathSection === '/' && index !== 0) {
          return '';
        }

        const breadcrumb = getBreadcrumbMatch({
          currentSection,
          location,
          pathSection,
          branches,
          ...options,
        });

        // Add the breadcrumb to the matches array
        // unless the user has explicitly passed.
        // { path: x, breadcrumb: null } to disable.
        if (breadcrumb !== NO_BREADCRUMB) {
          breadcrumbs.push(breadcrumb);
        }

        return pathSection === '/' ? '' : pathSection;
      },
      '',
    );

  return breadcrumbs;
};

/**
 * Default hook function export.
 */
const useReactRouterBreadcrumbs = (
  routes?: BreadcrumbsRoute[],
  options?: Options,
): BreadcrumbData[] => getBreadcrumbs({
  routes: routes || [],
  location: useLocation(),
  options,
});

export default useReactRouterBreadcrumbs;
