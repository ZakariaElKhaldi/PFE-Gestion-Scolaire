/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/ban-types */
declare module "expo-router" {
  import type { LinkProps as OriginalLinkProps } from 'expo-router/build/link/Link';
  import type { Router as OriginalRouter } from 'expo-router/src/types';
  export * from 'expo-router/build';

  // prettier-ignore
  type StaticRoutes = `/` | `/(app)/admin/classes` | `/admin/classes` | `/(app)/admin/courses` | `/admin/courses` | `/(app)/admin/dashboard` | `/admin/dashboard` | `/(app)/admin/documents` | `/admin/documents` | `/(app)/admin/logs` | `/admin/logs` | `/(app)/admin/payments` | `/admin/payments` | `/(app)/admin/reports` | `/admin/reports` | `/(app)/admin/settings` | `/admin/settings` | `/(app)/admin/users` | `/admin/users` | `/(app)/admin/_layout` | `/admin/_layout` | `/(app)/parent/children` | `/parent/children` | `/(app)/parent/dashboard` | `/parent/dashboard` | `/(app)/parent/documents` | `/parent/documents` | `/(app)/parent/messages` | `/parent/messages` | `/(app)/parent/payments` | `/parent/payments` | `/(app)/parent/profile` | `/parent/profile` | `/(app)/parent/_layout` | `/parent/_layout` | `/(app)/student/assignments` | `/student/assignments` | `/(app)/student/courses` | `/student/courses` | `/(app)/student/dashboard` | `/student/dashboard` | `/(app)/student/documents` | `/student/documents` | `/(app)/student/materials` | `/student/materials` | `/(app)/student/messages` | `/student/messages` | `/(app)/student/payment-methods` | `/student/payment-methods` | `/(app)/student/payments` | `/student/payments` | `/(app)/student/profile` | `/student/profile` | `/(app)/student/_layout` | `/student/_layout` | `/(app)/teacher/assignments` | `/teacher/assignments` | `/(app)/teacher/attendance` | `/teacher/attendance` | `/(app)/teacher/classes` | `/teacher/classes` | `/(app)/teacher/dashboard` | `/teacher/dashboard` | `/(app)/teacher/documents` | `/teacher/documents` | `/(app)/teacher/materials` | `/teacher/materials` | `/(app)/teacher/messages` | `/teacher/messages` | `/(app)/teacher/profile` | `/teacher/profile` | `/(app)/teacher/students/` | `/teacher/students/` | `/(app)/teacher/students` | `/(app)/teacher/students/_layout` | `/teacher/students/_layout` | `/(app)/teacher/_layout` | `/teacher/_layout` | `/(app)/_layout` | `/_layout` | `/(auth)/(parent)/` | `/(auth)/(parent)` | `/(auth)/(parent)/_layout` | `/(auth)/(student)/` | `/(auth)/(student)` | `/(auth)/(student)/_layout` | `/(auth)/(teacher)/` | `/(auth)/(teacher)` | `/(auth)/(teacher)/_layout` | `/(auth)/forgot-password` | `/forgot-password` | `/(auth)/login` | `/login` | `/(auth)/role-select` | `/role-select` | `/(auth)/signup` | `/signup` | `/(auth)/_layout`;
  // prettier-ignore
  type DynamicRoutes<T extends string> = `/(app)/teacher/students/${SingleRoutePart<T>}` | `/teacher/students/${SingleRoutePart<T>}`;
  // prettier-ignore
  type DynamicRouteTemplate = `/(app)/teacher/students/[id]`;

  type RelativePathString = `./${string}` | `../${string}` | '..';
  type AbsoluteRoute = DynamicRouteTemplate | StaticRoutes;
  type ExternalPathString = `http${string}`;
  type ExpoRouterRoutes = DynamicRouteTemplate | StaticRoutes | RelativePathString;
  type AllRoutes = ExpoRouterRoutes | ExternalPathString;

  /****************
   * Route Utils  *
   ****************/

  type SearchOrHash = `?${string}` | `#${string}`;
  type UnknownInputParams = Record<string, string | number | (string | number)[]>;
  type UnknownOutputParams = Record<string, string | string[]>;

  /**
   * Return only the RoutePart of a string. If the string has multiple parts return never
   *
   * string   | type
   * ---------|------
   * 123      | 123
   * /123/abc | never
   * 123?abc  | never
   * ./123    | never
   * /123     | never
   * 123/../  | never
   */
  type SingleRoutePart<S extends string> = S extends `${string}/${string}`
    ? never
    : S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S extends `(${string})`
    ? never
    : S extends `[${string}]`
    ? never
    : S;

  /**
   * Return only the CatchAll router part. If the string has search parameters or a hash return never
   */
  type CatchAllRoutePart<S extends string> = S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S extends `${string}(${string})${string}`
    ? never
    : S extends `${string}[${string}]${string}`
    ? never
    : S;

  // type OptionalCatchAllRoutePart<S extends string> = S extends `${string}${SearchOrHash}` ? never : S

  /**
   * Return the name of a route parameter
   * '[test]'    -> 'test'
   * 'test'      -> never
   * '[...test]' -> '...test'
   */
  type IsParameter<Part> = Part extends `[${infer ParamName}]` ? ParamName : never;

  /**
   * Return a union of all parameter names. If there are no names return never
   *
   * /[test]         -> 'test'
   * /[abc]/[...def] -> 'abc'|'...def'
   */
  type ParameterNames<Path> = Path extends `${infer PartA}/${infer PartB}`
    ? IsParameter<PartA> | ParameterNames<PartB>
    : IsParameter<Path>;

  /**
   * Returns all segements of a route.
   *
   * /(group)/123/abc/[id]/[...rest] -> ['(group)', '123', 'abc', '[id]', '[...rest]'
   */
  type RouteSegments<Path> = Path extends `${infer PartA}/${infer PartB}`
    ? PartA extends '' | '.'
      ? [...RouteSegments<PartB>]
      : [PartA, ...RouteSegments<PartB>]
    : Path extends ''
    ? []
    : [Path];

  /**
   * Returns a Record of the routes parameters as strings and CatchAll parameters
   *
   * There are two versions, input and output, as you can input 'string | number' but
   *  the output will always be 'string'
   *
   * /[id]/[...rest] -> { id: string, rest: string[] }
   * /no-params      -> {}
   */
  type InputRouteParams<Path> = {
    [Key in ParameterNames<Path> as Key extends `...${infer Name}`
      ? Name
      : Key]: Key extends `...${string}` ? (string | number)[] : string | number;
  } & UnknownInputParams;

  type OutputRouteParams<Path> = {
    [Key in ParameterNames<Path> as Key extends `...${infer Name}`
      ? Name
      : Key]: Key extends `...${string}` ? string[] : string;
  } & UnknownOutputParams;

  /**
   * Returns the search parameters for a route.
   */
  export type SearchParams<T extends AllRoutes> = T extends DynamicRouteTemplate
    ? OutputRouteParams<T>
    : T extends StaticRoutes
    ? never
    : UnknownOutputParams;

  /**
   * Route is mostly used as part of Href to ensure that a valid route is provided
   *
   * Given a dynamic route, this will return never. This is helpful for conditional logic
   *
   * /test         -> /test, /test2, etc
   * /test/[abc]   -> never
   * /test/resolve -> /test, /test2, etc
   *
   * Note that if we provide a value for [abc] then the route is allowed
   *
   * This is named Route to prevent confusion, as users they will often see it in tooltips
   */
  export type Route<T> = T extends string
    ? T extends DynamicRouteTemplate
      ? never
      :
          | StaticRoutes
          | RelativePathString
          | ExternalPathString
          | (T extends `${infer P}${SearchOrHash}`
              ? P extends DynamicRoutes<infer _>
                ? T
                : never
              : T extends DynamicRoutes<infer _>
              ? T
              : never)
    : never;

  /*********
   * Href  *
   *********/

  export type Href<T> = T extends Record<'pathname', string> ? HrefObject<T> : Route<T>;

  export type HrefObject<
    R extends Record<'pathname', string>,
    P = R['pathname']
  > = P extends DynamicRouteTemplate
    ? { pathname: P; params: InputRouteParams<P> }
    : P extends Route<P>
    ? { pathname: Route<P> | DynamicRouteTemplate; params?: never | InputRouteParams<never> }
    : never;

  /***********************
   * Expo Router Exports *
   ***********************/

  export type Router = Omit<OriginalRouter, 'push' | 'replace' | 'setParams'> & {
    /** Navigate to the provided href. */
    push: <T>(href: Href<T>) => void;
    /** Navigate to route without appending to the history. */
    replace: <T>(href: Href<T>) => void;
    /** Update the current route query params. */
    setParams: <T = ''>(params?: T extends '' ? Record<string, string> : InputRouteParams<T>) => void;
  };

  /** The imperative router. */
  export const router: Router;

  /************
   * <Link /> *
   ************/
  export interface LinkProps<T> extends OriginalLinkProps {
    href: Href<T>;
  }

  export interface LinkComponent {
    <T>(props: React.PropsWithChildren<LinkProps<T>>): JSX.Element;
    /** Helper method to resolve an Href object into a string. */
    resolveHref: <T>(href: Href<T>) => string;
  }

  /**
   * Component to render link to another route using a path.
   * Uses an anchor tag on the web.
   *
   * @param props.href Absolute path to route (e.g. `/feeds/hot`).
   * @param props.replace Should replace the current route without adding to the history.
   * @param props.asChild Forward props to child component. Useful for custom buttons.
   * @param props.children Child elements to render the content.
   */
  export const Link: LinkComponent;
  
  /** Redirects to the href as soon as the component is mounted. */
  export const Redirect: <T>(
    props: React.PropsWithChildren<{ href: Href<T> }>
  ) => JSX.Element;

  /************
   * Hooks *
   ************/
  export function useRouter(): Router;

  export function useLocalSearchParams<
    T extends AllRoutes | UnknownOutputParams = UnknownOutputParams
  >(): T extends AllRoutes ? SearchParams<T> : T;

  /** @deprecated renamed to `useGlobalSearchParams` */
  export function useSearchParams<
    T extends AllRoutes | UnknownOutputParams = UnknownOutputParams
  >(): T extends AllRoutes ? SearchParams<T> : T;

  export function useGlobalSearchParams<
    T extends AllRoutes | UnknownOutputParams = UnknownOutputParams
  >(): T extends AllRoutes ? SearchParams<T> : T;

  export function useSegments<
    T extends AbsoluteRoute | RouteSegments<AbsoluteRoute> | RelativePathString
  >(): T extends AbsoluteRoute ? RouteSegments<T> : T extends string ? string[] : T;
}
