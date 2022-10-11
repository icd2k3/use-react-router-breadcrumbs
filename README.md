# Important
As of `react-router v6.4` there is an [officially supported way](https://reactrouter.com/en/main/hooks/use-matches#breadcrumbs) of producing breadcrumbs. I recommend using this approach, but if it doesn't cover your specific use case, please let us know in the issues.

<h3 align="center">
  use-react-router-breadcrumbs
</h3>

<p align="center">
  <a href="https://github.com/icd2k3/use-react-router-breadcrumbs/actions" target="_blank"><img src="https://github.com/icd2k3/use-react-router-breadcrumbs/workflows/Node.js%20CI/badge.svg" /></a>
  <a href='https://coveralls.io/github/icd2k3/use-react-router-breadcrumbs?branch=master'><img src='https://coveralls.io/repos/github/icd2k3/use-react-router-breadcrumbs/badge.svg?branch=master' alt='Coverage Status' /></a>
</p>

<p align="center">
  A small (~1.25kb gzip), flexible, <a href="https://reactjs.org/docs/hooks-intro.html">hook</a> for rendering breadcrumbs with <a href="https://github.com/ReactTraining/react-router">react-router 6</a>.
</p>

<hr/>
  <h4 align="center">
    <code>
      example.com/user/123 → Home / User / John Doe
    </code>
  </h4>
<hr/>

<p align="center">
  Using an <b>older version</B> of <code>react-router</code>? Check out <a href="https://github.com/icd2k3/react-router-breadcrumbs-hoc">react-router-breadcrumbs-hoc</a> which is compatible with v4 and v5.
</p>

---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Description](#description)
  - [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Examples](#examples)
  - [Simple](#simple)
  - [Advanced](#advanced)
- [Route config compatibility](#route-config-compatibility)
- [Dynamic breadcrumb components](#dynamic-breadcrumb-components)
- [Options](#options)
  - [Disabling default generated breadcrumbs](#disabling-default-generated-breadcrumbs)
- [Order matters!](#order-matters)
- [API](#api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Description

Render breadcrumbs for `react-router` 6 however you want!

#### Features

- Easy to get started with automatically generated breadcrumbs.
- Render, map, and wrap breadcrumbs any way you want.
- Compatible with existing [route objects](https://reactrouter.com/docs/en/v6/examples/route-objects).

## Install

`yarn add use-react-router-breadcrumbs`

or

`npm i use-react-router-breadcrumbs --save`

## Usage

```js
const breadcrumbs = useBreadcrumbs();
```

## Examples

### Simple

Start seeing generated breadcrumbs right away with this simple example

```js
import useBreadcrumbs from "use-react-router-breadcrumbs";

const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();

  return (
    <React.Fragment>
      {breadcrumbs.map(({ breadcrumb }) => breadcrumb)}
    </React.Fragment>
  );
};
```

### Advanced

The example above will work for some routes, but you may want other routes to be dynamic (such as a user name breadcrumb). Let's modify it to handle custom-set breadcrumbs.

```js
import useBreadcrumbs from "use-react-router-breadcrumbs";

const userNamesById = { 1: "John" };

const DynamicUserBreadcrumb = ({ match }) => (
  <span>{userNamesById[match.params.userId]}</span>
);

const CustomPropsBreadcrumb = ({ someProp }) => <span>{someProp}</span>;

// define custom breadcrumbs for certain routes.
// breadcrumbs can be components or strings.
const routes = [
  { path: "/users/:userId", breadcrumb: DynamicUserBreadcrumb },
  { path: "/example", breadcrumb: "Custom Example" },
  {
    path: "/custom-props",
    breadcrumb: CustomPropsBreadcrumb,
    props: { someProp: "Hi" },
  },
];

// map & render your breadcrumb components however you want.
const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs(routes);

  return (
    <>
      {breadcrumbs.map(({ match, breadcrumb }) => (
        <NavLink key={match.pathname} to={match.pathname}>
          {breadcrumb}
        </NavLink>
      ))}
    </>
  );
};
```

For the above example...

| Pathname      | Result                |
| ------------- | --------------------- |
| /users        | Home / Users          |
| /users/1      | Home / Users / John   |
| /example      | Home / Custom Example |
| /custom-props | Home / Hi             |

### Advanced (Declarative Routes)

Same as the example above using Declarative Routing.

```js
import useBreadcrumbs, { createRoutesFromChildren, Route } from 'use-react-router-breadcrumbs';

const userNamesById = { '1': 'John' }

const DynamicUserBreadcrumb = ({ match }) => (
  <span>{userNamesById[match.params.userId]}</span>
);

const CustomPropsBreadcrumb = ({ someProp }) => (
  <span>{someProp}</span>
);

// define custom breadcrumbs for certain routes.
// breadcrumbs can be components or strings.

// map & render your breadcrumb components however you want.
const BreadcrumbTrail = ({ breadCrumbs }) => {
  return (
    <>
      {breadcrumbs.map(({
        match,
        breadcrumb
      }) => (
        <span key={match.pathname}>
          <NavLink to={match.pathname}>{breadcrumb}</NavLink>
        </span>
      ))}
    </>
  );
};

const GenerateAppRoutes = () => {
  // Full declarative react router support. example: Element, children, Nested Routes
  return (
    <Route path='/users/:userId' breadcrumb={DynamicUserBreadcrumb} element={<ProfilePage/>} />
    <Route path='/example' breadcrumb='Custom Example' >
      <Route path='/' breadcrumb='Custom Example' >
        <ExamplePage/>
      </Route>
    </Route>
    <Route path='/custom-props' breadcrumb={CustomPropsBreadcrumb} props={ someProp: 'Hi' } >
      <CustomPage/>
    </Route>
  )
};

const AppRouter = () => {
  // You could use context to set app Routes and add the breadcrumbs somewhere deeper in the application layout.
  const AppRoutes = GenerateAppRoutes();
  const appRouteObjects = createRoutesFromChildren(AppRoutes);
  const breadCrumbs = useBreadcrumbs(appRouteObjects)
  const GeneratedRoutes = useRoutes(appRouteObjects);
  return (
    <React.StrictMode>
      <Router>
        <BreadcrumbTrail breadCrumbs={breadCrumbs}/>
        <GenerateRoutes/>
      </Router>
    <React.StrictMode>
  )
}
```

For the above example...

| Pathname      | Result                |
| ------------- | --------------------- |
| /users        | Home / Users          |
| /users/1      | Home / Users / John   |
| /example      | Home / Custom Example |
| /custom-props | Home / Hi             |

## [Route object](https://reactrouter.com/docs/en/v6/examples/route-objects) compatibility

Add breadcrumbs to your existing [route object](https://reactrouter.com/docs/en/v6/examples/route-objects). This is a great way to keep all routing config paths in a single place! If a path ever changes, you'll only have to change it in your main route config rather than maintaining a _separate_ config for `use-react-router-breadcrumbs`.

For example...

```js
const routes = [
  {
    path: "/sandwiches",
    element: <Sandwiches />,
  },
];
```

becomes...

```js
const routes = [
  {
    path: "/sandwiches",
    element: <Sandwiches />,
    breadcrumb: "I love sandwiches",
  },
];
```

then you can just pass the whole routes right into the hook:

```js
const breadcrumbs = useBreadcrumbs(routes);
```

## Dynamic breadcrumb components

If you pass a component as the `breadcrumb` prop it will be injected with react-router's [match](https://reactrouter.com/docs/en/v6/api#matchpath) and [location](https://reactrouter.com/docs/en/v6/api#location) objects as props. These objects contain ids, hashes, queries, etc... from the route that will allow you to map back to whatever you want to display in the breadcrumb.

Let's use `redux` as an example with the [match](https://reactrouter.com/docs/en/v6/api#matchpath) object:

```js
// UserBreadcrumb.jsx
const PureUserBreadcrumb = ({ firstName }) => <span>{firstName}</span>;

// find the user in the store with the `id` from the route
const mapStateToProps = (state, props) => ({
  firstName: state.userReducer.usersById[props.match.params.id].firstName,
});

export default connect(mapStateToProps)(PureUserBreadcrumb);

// routes = [{ path: '/users/:id', breadcrumb: UserBreadcrumb }]
// example.com/users/123 --> Home / Users / John
```

Now we can pass this custom `redux` breadcrumb into the hook:

```js
const breadcrumbs = useBreadcrumbs([
  {
    path: "/users/:id",
    breadcrumb: UserBreadcrumb,
  },
]);
```

You cannot use hooks that rely on `RouteContext` like `useParams`, because the breadcrumbs are not in the context, you should use `match.params` instead:

```tsx
import type { BreadcrumbComponentType } from "use-react-router-breadcrumbs";

const UserBreadcrumb: BreadcrumbComponentType<"id"> = ({ match }) => {
  return <div>{match.params.id}</div>;
};
```

---

Similarly, the [location](https://reactrouter.com/docs/en/v6/api#location) object could be useful for displaying dynamic breadcrumbs based on the route's state:

```jsx
// dynamically update EditorBreadcrumb based on state info
const EditorBreadcrumb = ({ location: { state: { isNew } } }) => (
  <span>{isNew ? 'Add New' : 'Update'}</span>
);

// routes = [{ path: '/editor', breadcrumb: EditorBreadcrumb }]

// upon navigation, breadcrumb will display: Update
<Link to={{ pathname: '/editor' }}>Edit</Link>

// upon navigation, breadcrumb will display: Add New
<Link to={{ pathname: '/editor', state: { isNew: true } }}>Add</Link>
```

## Options

An options object can be passed as the 2nd argument to the hook.

```js
useBreadcrumbs(routes, options);
```

| Option            | Type            | Description                                                |
| ----------------- | --------------- | ---------------------------------------------------------- |
| `disableDefaults` | `Boolean`       | Disables all default generated breadcrumbs.                |
| `excludePaths`    | `Array<String>` | Disables default generated breadcrumbs for specific paths. |

### Disabling default generated breadcrumbs

This package will attempt to create breadcrumbs for you based on the route section. For example `/users` will automatically create the breadcrumb `"Users"`. There are two ways to disable default breadcrumbs for a path:

**Option 1:** Disable _all_ default breadcrumb generation by passing `disableDefaults: true` in the `options` object

```js
const breadcrumbs = useBreadcrumbs(routes, { disableDefaults: true });
```

**Option 2:** Disable _individual_ default breadcrumbs by passing `breadcrumb: null` in route config:

```js
const routes = [{ path: "/a/b", breadcrumb: null }];
```

**Option 3:** Disable _individual_ default breadcrumbs by passing an `excludePaths` array in the `options` object

```js
useBreadcrumbs(routes, {
  excludePaths: ["/", "/no-breadcrumb/for-this-route"],
});
```

## Order matters!

`use-react-router-breadcrumbs` uses the [same strategy](https://reactrouter.com/docs/en/v6/getting-started/concepts#ranking-routes) as `react-router 6` to calculate the routing order.

```js
[
  {
    path: "users",
    children: [
      { path: ":id", breadcrumb: "id-breadcrumb" },
      { path: "create", breadcrumb: "create-breadcrumb" },
    ],
  },
];
```

If the user visits `example.com/users/create` they will see `create-breadcrumb`.

In addition, if the index route and the parent route provide breadcrumb at the same time, the index route provided will be used first:

```js
[
  {
    path: "users",
    breadcrumb: "parent-breadcrumb",
    children: [{ index: true, breadcrumb: "child-breadcrumb" }],
  },
];
```

If the user visits `example.com/users` they will see `child-breadcrumb`.

## API

```ts
interface BreadcrumbComponentProps<ParamKey extends string = string> {
  key: string;
  match: BreadcrumbMatch<ParamKey>;
  location: Location;
}

type BreadcrumbComponentType<ParamKey extends string = string> =
  React.ComponentType<BreadcrumbComponentProps<ParamKey>>;

interface BreadcrumbsRoute<ParamKey extends string = string>
  extends RouteObject {
  children?: BreadcrumbsRoute[];
  breadcrumb?: BreadcrumbComponentType<ParamKey> | string | null;
  props?: { [x: string]: unknown };
}

interface Options {
  // disable all default generation of breadcrumbs
  disableDefaults?: boolean;
  // exclude certain paths fom generating breadcrumbs
  excludePaths?: string[];
  // optionally define a default formatter for generating breadcrumbs from URL segments
  defaultFormatter?: (string) => string;
}

interface BreadcrumbData<ParamKey extends string = string> {
  match: BreadcrumbMatch<ParamKey>;
  location: Location;
  key: string;
  breadcrumb: React.ReactNode;
}

// if routes are not passed, default breadcrumbs will be returned
function useBreadcrumbs(
  routes?: BreadcrumbsRoute[],
  options?: Options
): BreadcrumbData[];
```
