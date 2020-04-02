/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import useBreadcrumbs, {
  BreadcrumbsRoute,
  BreadcrumbsProps,
} from 'use-react-router-breadcrumbs';

interface UserBreadcrumbProps
  extends RouteComponentProps<{
      userId: string;
    }> {}

const UserBreadcrumb = ({ match }: UserBreadcrumbProps) => (
  <span>{match.params.userId}</span>
);

const routes: BreadcrumbsRoute[] = [
  { path: '/users/:userId', breadcrumb: UserBreadcrumb },
  { path: '/example', breadcrumb: 'Custom Example' },
  {
    path: '/test-match-options',
    breadcrumb: 'Match Options',
    matchOptions: { exact: true, strict: true },
  },
];

const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs(routes);

  return (
    <div>
      {breadcrumbs.map(({ breadcrumb, match }: BreadcrumbsProps, index: number) => (
        <span key={match.url}>
          <a href={match.url}>{breadcrumb}</a>
          {index < breadcrumbs.length - 1 && <i> / </i>}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumbs;
