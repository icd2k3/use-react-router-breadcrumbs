/* eslint-disable react/require-default-props */
/* eslint-disable react/no-array-index-key */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter as Router, useLocation, useRoutes } from 'react-router-dom';
import useBreadcrumbs, { getBreadcrumbs, createRoutesFromChildren, BreadcrumbsRoute, Route, Options, BreadcrumbComponentProps, BreadcrumbComponentType } from './index';

// imports to test compiled builds
import useBreadcrumbsCompiledES, {
  getBreadcrumbs as getBreadcrumbsCompiledES,
} from '../dist/es/index';
import useBreadcrumbsCompiledUMD, {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getBreadcrumbs as getBreadcrumbsCompiledUMD,
} from '../dist/umd/index';
import useBreadcrumbsCompiledCJS, {
  getBreadcrumbs as getBreadcrumbsCompiledCJS,
} from '../dist/cjs/index';

interface ExtraPropsTest extends BreadcrumbComponentProps {
  foo?: string;
  bar?: string;
}

const components = {
  Breadcrumbs: ({
    useBreadcrumbs: useBreadcrumbsHook,
    options,
    routes,
    ...forwardedProps
  }: {
    useBreadcrumbs: (r?: BreadcrumbsRoute[], o?: Options) => []
    options?: Options
    routes?: BreadcrumbsRoute[]
  }) => {
    const breadcrumbs = useBreadcrumbsHook(routes, options);
    const location = useLocation();

    return (
      <h1>
        <span>{location.pathname}</span>
        <div data-test-id="forwarded-props">
          {forwardedProps
            && Object.values(forwardedProps)
              .filter((v: unknown) => typeof v === 'string')
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              .map((value: string) => <span key={value}>{value}</span>)}
        </div>
        <div className="breadcrumbs-container">
          {breadcrumbs.map(({ breadcrumb, key }, index) => (
            <span key={key}>
              {breadcrumb}
              {index < breadcrumbs.length - 1 && <i> / </i>}
            </span>
          ))}
        </div>
      </h1>
    );
  },
  BreadcrumbMatchTest: (
    { match }: { match?: { params?: { number?: number } } },
  ) => <span>{match?.params?.number}</span>,

  BreadcrumbRouteTest: (
    { match }: { match: { route?: { arbitraryProp: string } } },
  ) => <span>{match.route?.arbitraryProp}</span>,

  BreadcrumbNavLinkTest: (
    { match }: { match: { pathname: string } },
  ) => <a href={match.pathname}>Link</a>,

  BreadcrumbLocationTest: ({
    location,
  }: BreadcrumbComponentProps) => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <span>{location?.state?.isLocationTest ? 'pass' : 'fail'}</span>
  ),

  BreadcrumbExtraPropsTest: (props: ExtraPropsTest) => (
    <>
      <span>{props.foo}</span>
      <span>{props.bar}</span>
    </>
  ),

  BreadcrumbMemoized: React.memo(() => <span>Memoized</span>),

  // eslint-disable-next-line react/prefer-stateless-function
  BreadcrumbClass: class BreadcrumbClass extends React.PureComponent<BreadcrumbComponentProps> {
    render() {
      return <span>Class</span>;
    }
  },

  NestedRouteObjects: () => {
    const usersById = { 1: 'Mike' };
    // eslint-disable-next-line react/function-component-definition
    const UserDetailBreadcrumb: BreadcrumbComponentType<string> = ({
      // eslint-disable-next-line
      match
    }: { match: { params?: { userId?: number } } }) => (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <span>{match?.params?.userId ? usersById[match?.params?.userId] : 'User not found'}</span>
    );
    const element = useRoutes([
      {
        path: '/',
        element: <span>Users</span>,
        children: [
          {
            path: ':userId',
            breadcrumb: UserDetailBreadcrumb,
            element: <span>User</span>,
            children: [
              { path: 'edit', element: <span>Edit</span> },
              { path: '*', element: <span>Wild</span> },
            ],
          },
        ],
      },
    ] as BreadcrumbsRoute[]);

    return element;
  },

  // eslint-disable-next-line react/require-default-props
  Layout: React.memo(({ children }: { children?: React.ReactNode }) => <div>{children}</div>),
};

const getHOC = () => {
  switch (process.env.TEST_BUILD) {
    case 'cjs':
      return useBreadcrumbsCompiledCJS;
    case 'umd':
      return useBreadcrumbsCompiledUMD;
    case 'es':
      return useBreadcrumbsCompiledES;
    default:
      return useBreadcrumbs;
  }
};

const getMethod = () => {
  switch (process.env.TEST_BUILD) {
    case 'cjs':
      return getBreadcrumbsCompiledCJS;
    case 'umd':
      return getBreadcrumbsCompiledUMD;
    case 'es':
      return getBreadcrumbsCompiledES;
    default:
      return getBreadcrumbs;
  }
};

const renderer = (
  { options, pathname, routes, state, props }:
  {
    options?: Options
    pathname: string
    routes?: BreadcrumbsRoute<string>[]
    state?: { isLocationTest: boolean }
    props?: { [x: string]: unknown }
  },
) => {
  const useBreadcrumbsHook = getHOC();
  const { Breadcrumbs } = components;

  const wrapper = render(
    <Router initialIndex={0} initialEntries={[{ pathname, state }]}>
      <Breadcrumbs
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        useBreadcrumbs={useBreadcrumbsHook}
        options={options}
        routes={routes}
        {...(props || {})}
      />
    </Router>,
  );

  return {
    wrapper,
  };
};

const getByTextContent = (text: string) => screen.getByText((content, element) => {
  const hasText = (ele: Element | null) => ele?.textContent === text;
  const elementHasText = hasText(element);
  const childrenDontHaveText = (element?.children ? Array.from(element.children) : [])
    .every((child) => !hasText(child));

  return elementHasText && childrenDontHaveText;
});

describe('use-react-router-breadcrumbs', () => {
  describe('Valid routes', () => {
    it('Should render breadcrumb components as expected', () => {
      const { BreadcrumbMatchTest } = components;
      const routes: BreadcrumbsRoute[] = [
        // test home route
        { path: '/', breadcrumb: 'Home' },
        // test breadcrumb passed as string
        { path: '/1', breadcrumb: 'One' },
        // test simple breadcrumb component
        { path: '/1/2', breadcrumb: () => <span>TWO</span> },
        // test advanced breadcrumb component (user can use `match` however they wish)
        { path: '/1/2/:number', breadcrumb: BreadcrumbMatchTest },
        // test NavLink wrapped breadcrumb
        {
          path: '/1/2/:number/4',
          breadcrumb: components.BreadcrumbNavLinkTest,
        },
        // test a `*` route
        { path: '*', breadcrumb: 'Any' },
      ];
      renderer({
        pathname: '/1/2/3/4/5',
        routes,
      });
      expect(getByTextContent('Home / One / TWO / 3 / Link / Any')).toBeTruthy();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/1/2/3/4');
    });
  });

  describe('Route order', () => {
    it('Should intelligently match the more suitable breadcrumb in route array user/create', () => {
      const routes = [
        { path: '/', breadcrumb: 'Home' },
        // index has higher score
        { index: true, breadcrumb: 'Root' },
        { path: '/user/:id', breadcrumb: '1' },
        { path: '/user/create', breadcrumb: 'Add User' },
      ];
      renderer({ pathname: '/user/create', routes });
      expect(getByTextContent('Root / User / Add User')).toBeTruthy();
    });

    it('Should match the correct breadcrumb in route if they have the same score', () => {
      const routes = [
        {
          path: 'user/*',
          breadcrumb: 'User',
          children: [{ index: true, breadcrumb: 'Hello' }],
        },
        {
          path: 'user/:pid',
          children: [{ path: '*', breadcrumb: 'World' }],
        },
        {
          path: 'user/create',
          breadcrumb: 'First Create',
        },
        {
          path: 'user/create',
          breadcrumb: 'Last Create',
        },
      ];
      renderer({ pathname: '/user/create/x', routes });
      expect(getByTextContent('Home / User / First Create / World')).toBeTruthy();
    });
  });

  describe('Different component types', () => {
    it('Should render memoized components', () => {
      const routes = [
        { path: '/memo', breadcrumb: components.BreadcrumbMemoized },
      ];
      renderer({ pathname: '/memo', routes });
      expect(getByTextContent('Home / Memoized')).toBeTruthy();
    });

    it('Should render class components', () => {
      const routes = [
        { path: '/class', breadcrumb: components.BreadcrumbClass },
      ];
      renderer({ pathname: '/class', routes });
      expect(getByTextContent('Home / Class')).toBeTruthy();
    });
  });

  describe('Custom match options', () => {
    it('Should allow `caseSensitive` rule', () => {
      const routes = [
        {
          path: '/one',
          breadcrumb: '1',
          caseSensitive: true,
        },
      ];
      renderer({ pathname: '/OnE', routes });
      expect(getByTextContent('Home / OnE')).toBeTruthy();
    });
  });

  describe('When extending react-router config', () => {
    it('Should render expected breadcrumbs with sensible defaults', () => {
      const routes = [
        { path: '/one', breadcrumb: 'OneCustom' },
        { path: '/one/two' },
      ];
      renderer({ pathname: '/one/two', routes });
      expect(getByTextContent('Home / OneCustom / Two')).toBeTruthy();
    });

    it('Should support nested routes', () => {
      const routes = [
        {
          path: '/one',
          children: [
            {
              path: '/one/two',
              breadcrumb: 'TwoCustom',
              children: [{ path: '/one/two/three', breadcrumb: 'ThreeCustom' }],
            },
          ],
        },
      ];
      renderer({ pathname: '/one/two/three', routes });
      expect(getByTextContent('Home / One / TwoCustom / ThreeCustom')).toBeTruthy();
    });

    it('Should support nested routes with relative path', () => {
      const routes = [
        {
          path: 'one',
          children: [
            {
              path: 'two',
              breadcrumb: 'TwoCustom',
              children: [{ path: 'three', breadcrumb: 'ThreeCustom' }],
            },
          ],
        },
      ];
      renderer({ pathname: '/one/two/three', routes });
      expect(getByTextContent('Home / One / TwoCustom / ThreeCustom')).toBeTruthy();
    });

    it('Should allow layout routes', () => {
      const routes = [
        {
          element: <components.Layout />,
          children: [
            {
              path: 'about',
              breadcrumb: 'About',
            },
          ],
        },
        {
          index: true,
          breadcrumb: 'Home',
        },
      ];
      renderer({ pathname: '/about', routes });
      expect(getByTextContent('Home / About')).toBeTruthy();
    });

    it('Should allow layout routes for declarative routes', () => {
      const DeclarativeRoutes = (
        <>
          <Route path="/" element={<components.Layout />}>
            <Route path="about" breadcrumb="About" />
          </Route>
          <Route index breadcrumb="Home" />
          {false && <Route>unreached route</Route>}
        </>
      );
      const routeObject = createRoutesFromChildren(DeclarativeRoutes);
      renderer({ pathname: '/about', routes: routeObject });
      expect(getByTextContent('Home / About')).toBeTruthy();
    });

    it('Should throw if non route is used in Routes object', () => {
      const DeclarativeRoutes = (
        <div>div is not allowed as immediate child of Routes</div>
      );
      expect(() => { createRoutesFromChildren(DeclarativeRoutes); }).toThrow();
    });

    it('Should use the breadcrumb provided by parent if the index route dose not provide one', () => {
      const routes = [
        {
          path: 'one',
          breadcrumb: 'Parent',
          children: [{ index: true }],
        },
      ];
      renderer({ pathname: '/one', routes });
      expect(getByTextContent('Home / Parent')).toBeTruthy();
    });

    it('Should use the default breadcrumb If neither the index route nor the parent route provide breadcrumb', () => {
      const routes = [
        {
          path: 'one',
          children: [{ index: true }],
        },
      ];
      renderer({ pathname: '/one', routes });
      expect(getByTextContent('Home / One')).toBeTruthy();
    });
  });

  describe('Defaults', () => {
    describe('No routes array', () => {
      it('Should automatically renderer breadcrumbs with default strings', () => {
        renderer({ pathname: '/one/two' });
        expect(getByTextContent('Home / One / Two')).toBeTruthy();
      });
    });

    describe('Override defaults', () => {
      it('Should render user-provided breadcrumbs where possible and use defaults otherwise', () => {
        const routes = [{ path: '/one', breadcrumb: 'Override' }];
        renderer({ pathname: '/one/two', routes });
        expect(getByTextContent('Home / Override / Two')).toBeTruthy();
      });
    });

    describe('No breadcrumb', () => {
      it('Should be possible to NOT renderer a breadcrumb', () => {
        const routes = [{ path: '/one', breadcrumb: null }];
        renderer({ pathname: '/one/two', routes });
        expect(getByTextContent('Home / Two')).toBeTruthy();
      });

      it('Should be possible to NOT renderer a "Home" breadcrumb', () => {
        const routes = [{ path: '/', breadcrumb: null }];
        renderer({ pathname: '/one/two', routes });
        expect(getByTextContent('One / Two')).toBeTruthy();
      });
    });
  });

  describe('When using the location object', () => {
    it('Should be provided in the renderered breadcrumb component', () => {
      const routes = [
        { path: '/one', breadcrumb: components.BreadcrumbLocationTest },
      ];
      renderer({
        pathname: '/one',
        state: { isLocationTest: true },
        routes,
      });
      expect(getByTextContent('Home / pass')).toBeTruthy();
    });
  });

  describe('When pathname includes query params', () => {
    it('Should not renderer query breadcrumb', () => {
      renderer({ pathname: '/one?mock=query' });
      expect(getByTextContent('Home / One')).toBeTruthy();
    });
  });

  describe('When pathname includes a trailing slash', () => {
    it('Should ignore the trailing slash', () => {
      renderer({ pathname: '/one/' });
      expect(getByTextContent('Home / One')).toBeTruthy();
    });
  });

  describe('When using additional props inside routes', () => {
    it('Should pass through extra props to user-provided components', () => {
      const routes = [
        {
          path: '/one',
          breadcrumb: components.BreadcrumbExtraPropsTest,
          props: {
            foo: 'Pass through',
            bar: ' props',
          },
        },
      ];
      renderer({ pathname: '/one', routes });
      expect(getByTextContent('Home / Pass through props')).toBeTruthy();
    });
  });

  describe('When using the route object', () => {
    it('should inject the matched route in the `match` property', () => {
      const routes = [
        {
          path: '/one',
          breadcrumb: components.BreadcrumbRouteTest,
          arbitraryProp: 'foobar',
        },
      ];

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore arbitrary prop is not expected, but should not error
      renderer({ pathname: '/one', routes });
      expect(getByTextContent('Home / foobar')).toBeTruthy();
    });
  });

  describe('Options', () => {
    describe('excludePaths', () => {
      it('Should not return breadcrumbs for specified paths', () => {
        renderer({
          pathname: '/one/two',
          options: { excludePaths: ['/', '/one'] },
        });
        expect(getByTextContent('Two')).toBeTruthy();
      });

      it('Should work with url params', () => {
        const routes = [
          { path: '/a' },
          { path: '/a/:b' },
          { path: '/a/:b/:c' },
        ];
        renderer({
          pathname: '/a/b/c',
          routes,
          options: { excludePaths: ['/a/:b', '/a'] },
        });
        expect(getByTextContent('Home / C')).toBeTruthy();
      });
    });

    describe('options without routes array', () => {
      it('Should be able to set options without defining a routes array', () => {
        renderer({
          pathname: '/one/two',
          options: { excludePaths: ['/', '/one'] },
        });
        expect(getByTextContent('Two')).toBeTruthy();
      });
    });

    describe('disableDefaults', () => {
      it('Should disable all default breadcrumb generation', () => {
        const routes = [
          { path: '/one', breadcrumb: 'One' },
          { path: '/one/two' },
        ];
        renderer({
          pathname: '/one/two',
          routes,
          options: { disableDefaults: true },
        });

        expect(getByTextContent('One')).toBeTruthy();
      });
    });

    describe('defaultFormatter', () => {
      it('should be used if a breadcrumb is not provided for a specific path', () => {
        const routes = [
          { path: '/one', breadcrumb: 'One' },
          { path: '/one/two' },
          { path: '/one/two/three_four' },
        ];
        renderer({
          pathname: '/one/two/three_four',
          routes,
          options: { defaultFormatter: (breadcrumb: string) => breadcrumb.replace(/two/g, 'changed') },
        });

        expect(getByTextContent('Home / One / changed / three_four')).toBeTruthy();
      });
    });
  });

  describe('Route objects nested in components', () => {
    it('should support nested route objects with breadcrumbs in child components', () => {
      const routes = [
        {
          path: '/',
          breadcrumb: 'Home',
          children: [
            {
              path: 'users/*',
              element: <components.NestedRouteObjects />,
            },
          ],
        },
      ];

      renderer({ pathname: '/users/1/edit', routes });
      expect(getByTextContent('Home / Users / Mike / Edit')).toBeTruthy();
    });

    it('should support lazy loading child components with breadcrumbs', () => {
      const routes = [
        {
          path: '/',
          breadcrumb: 'Home',
          children: [
            {
              path: 'users/*',
              element: <React.Suspense><components.NestedRouteObjects /></React.Suspense>,
            },
          ],
        },
      ];

      renderer({ pathname: '/users/1/edit', routes });
      expect(getByTextContent('Home / Users / Mike / Edit')).toBeTruthy();
    });

    it('should work normally if an element has no nested route objects and is a class component', () => {
      const routes = [
        {
          path: '/',
          breadcrumb: 'Home',
          children: [
            {
              path: 'users/*',
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              element: <components.BreadcrumbClass />,
            },
          ],
        },
      ];

      renderer({ pathname: '/users/1/edit', routes });
      expect(getByTextContent('Home / Users / 1 / Edit')).toBeTruthy();
    });
  });

  describe('Invalid route object', () => {
    it('Should error if `path` or `index` is not provided', () => {
      expect(() => getMethod()({
        routes: [{ breadcrumb: 'Yo' }],
        location: { pathname: '/1' },
      })).toThrow(
        'useBreadcrumbs: `path` or `index` must be provided in every route object',
      );
    });

    it('Should error if both `path` and `index` are provided', () => {
      expect(() => getMethod()({
        routes: [{ index: true, path: '/', breadcrumb: 'Yo' }],
        location: { pathname: '/1' },
      })).toThrow(
        'useBreadcrumbs: `path` and `index` cannot be provided at the same time',
      );
    });

    it('Should not support nested absolute paths', () => {
      expect(() => getMethod()({
        routes: [
          { path: '/a', breadcrumb: 'Yo', children: [{ path: '/b' }] },
        ],
        location: { pathname: '/1' },
      })).toThrow(
        'useBreadcrumbs: The absolute path of the child route must start with the parent path',
      );
    });

    it('Should error If the index route provides children', () => {
      expect(() => getMethod()({
        routes: [
          { index: true, breadcrumb: 'Yo', children: [{ path: '/b' }] },
        ],
        location: { pathname: '/1' },
      })).toThrow('useBreadcrumbs: Index route cannot have child routes');
    });
  });

  describe('HOC prop forwarding', () => {
    it('Should allow for forwarding props to the wrapped component', () => {
      const props = { testing: 'prop forwarding works' };
      renderer({ pathname: '/', props });
      expect(screen.getByText('prop forwarding works')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('Should handle 2 slashes in a URL (site.com/sandwiches//tuna)', () => {
      renderer({ pathname: '/sandwiches//tuna' });
      expect(getByTextContent('Home / Sandwiches / Tuna')).toBeTruthy();
    });
  });
});
