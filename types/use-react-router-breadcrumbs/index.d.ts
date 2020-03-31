/* eslint-disable no-unused-vars */
// Type definitions for use-react-router-breadcrumbs
import { RouteComponentProps } from 'react-router';

export interface Options {
  currentSection?: string;
  disableDefaults?: boolean;
  excludePaths?: string[];
  pathSection?: string;
}

export interface Location {
  pathname: string
}

export interface MatchOptions {
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
}

export interface BreadcrumbsRoute {
  path: string;
  breadcrumb?: React.ComponentType | React.ElementType | string;
  matchOptions?: MatchOptions;
  routes?: BreadcrumbsRoute[];
}

export interface BreadcrumbsProps<T = {}> extends RouteComponentProps<T> {
  breadcrumb: React.ComponentType | string;
}

export default function useBreadcrumbs<P>(
  routes?: BreadcrumbsRoute[],
  options?: Options
): Array<React.ReactNode | string>;
