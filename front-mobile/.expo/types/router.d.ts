/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/modal`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/attendance` | `/attendance`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/classes` | `/classes`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/departments` | `/departments`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/more` | `/more`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/settings` | `/settings`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/users` | `/users`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic` | `/academic`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/courses/add` | `/academic/courses/add`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/courses` | `/academic/courses`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/departments/add` | `/academic/departments/add`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/departments/edit` | `/academic/departments/edit`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/departments` | `/academic/departments`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/grades/add` | `/academic/grades/add`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/grades` | `/academic/grades`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/monitoring` | `/monitoring`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/monitoring/attendance` | `/monitoring/attendance`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/monitoring/schedule` | `/monitoring/schedule`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/staff` | `/staff`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/students/attendance` | `/students/attendance`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/students/grades` | `/students/grades`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/students` | `/students`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/teachers` | `/teachers`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/forgot-password` | `/forgot-password`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/sign-in` | `/sign-in`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/sign-up` | `/sign-up`; params?: Router.UnknownInputParams; } | { pathname: `${'/(debug)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(debug)'}/theme` | `/theme`; params?: Router.UnknownInputParams; } | { pathname: `${'/(teacher)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/modal`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/attendance` | `/attendance`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/classes` | `/classes`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/departments` | `/departments`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/more` | `/more`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/settings` | `/settings`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/users` | `/users`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/academic` | `/academic`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/academic/courses/add` | `/academic/courses/add`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/academic/courses` | `/academic/courses`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/academic/departments/add` | `/academic/departments/add`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/academic/departments/edit` | `/academic/departments/edit`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/academic/departments` | `/academic/departments`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/academic/grades/add` | `/academic/grades/add`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/academic/grades` | `/academic/grades`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/monitoring` | `/monitoring`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/monitoring/attendance` | `/monitoring/attendance`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/monitoring/schedule` | `/monitoring/schedule`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/staff` | `/staff`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/students/attendance` | `/students/attendance`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/students/grades` | `/students/grades`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/students` | `/students`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(admin)'}/teachers` | `/teachers`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/forgot-password` | `/forgot-password`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/sign-in` | `/sign-in`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/sign-up` | `/sign-up`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(debug)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(debug)'}/theme` | `/theme`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(teacher)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `/+not-found`, params: Router.UnknownOutputParams & {  } };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/modal${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/attendance${`?${string}` | `#${string}` | ''}` | `/attendance${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/classes${`?${string}` | `#${string}` | ''}` | `/classes${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/departments${`?${string}` | `#${string}` | ''}` | `/departments${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/more${`?${string}` | `#${string}` | ''}` | `/more${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/settings${`?${string}` | `#${string}` | ''}` | `/settings${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/users${`?${string}` | `#${string}` | ''}` | `/users${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/academic${`?${string}` | `#${string}` | ''}` | `/academic${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/academic/courses/add${`?${string}` | `#${string}` | ''}` | `/academic/courses/add${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/academic/courses${`?${string}` | `#${string}` | ''}` | `/academic/courses${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/academic/departments/add${`?${string}` | `#${string}` | ''}` | `/academic/departments/add${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/academic/departments/edit${`?${string}` | `#${string}` | ''}` | `/academic/departments/edit${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/academic/departments${`?${string}` | `#${string}` | ''}` | `/academic/departments${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/academic/grades/add${`?${string}` | `#${string}` | ''}` | `/academic/grades/add${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/academic/grades${`?${string}` | `#${string}` | ''}` | `/academic/grades${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/monitoring${`?${string}` | `#${string}` | ''}` | `/monitoring${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/monitoring/attendance${`?${string}` | `#${string}` | ''}` | `/monitoring/attendance${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/monitoring/schedule${`?${string}` | `#${string}` | ''}` | `/monitoring/schedule${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/staff${`?${string}` | `#${string}` | ''}` | `/staff${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/students/attendance${`?${string}` | `#${string}` | ''}` | `/students/attendance${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/students/grades${`?${string}` | `#${string}` | ''}` | `/students/grades${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/students${`?${string}` | `#${string}` | ''}` | `/students${`?${string}` | `#${string}` | ''}` | `${'/(admin)'}/teachers${`?${string}` | `#${string}` | ''}` | `/teachers${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/forgot-password${`?${string}` | `#${string}` | ''}` | `/forgot-password${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/sign-in${`?${string}` | `#${string}` | ''}` | `/sign-in${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/sign-up${`?${string}` | `#${string}` | ''}` | `/sign-up${`?${string}` | `#${string}` | ''}` | `${'/(debug)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(debug)'}/theme${`?${string}` | `#${string}` | ''}` | `/theme${`?${string}` | `#${string}` | ''}` | `${'/(teacher)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/modal`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/attendance` | `/attendance`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/classes` | `/classes`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/departments` | `/departments`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/more` | `/more`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/settings` | `/settings`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/users` | `/users`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic` | `/academic`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/courses/add` | `/academic/courses/add`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/courses` | `/academic/courses`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/departments/add` | `/academic/departments/add`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/departments/edit` | `/academic/departments/edit`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/departments` | `/academic/departments`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/grades/add` | `/academic/grades/add`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/academic/grades` | `/academic/grades`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/monitoring` | `/monitoring`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/monitoring/attendance` | `/monitoring/attendance`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/monitoring/schedule` | `/monitoring/schedule`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/staff` | `/staff`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/students/attendance` | `/students/attendance`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/students/grades` | `/students/grades`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/students` | `/students`; params?: Router.UnknownInputParams; } | { pathname: `${'/(admin)'}/teachers` | `/teachers`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/forgot-password` | `/forgot-password`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/sign-in` | `/sign-in`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/sign-up` | `/sign-up`; params?: Router.UnknownInputParams; } | { pathname: `${'/(debug)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(debug)'}/theme` | `/theme`; params?: Router.UnknownInputParams; } | { pathname: `${'/(teacher)'}` | `/`; params?: Router.UnknownInputParams; } | `/+not-found` | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
    }
  }
}
