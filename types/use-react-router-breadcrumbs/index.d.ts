// Type definitions for react-router-breadcrumbs-hoc 2.1
// Project: https://github.com/icd2k3/react-router-breadcrumbs-hoc
// Definitions by: 9renpoto <https://github.com/9renpoto>
// Definitions: https://github.com/icd2k3/react-router-breadcrumbs-hoc

import * as React from "react";
import { Omit, RouteComponentProps } from "react-router";

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
