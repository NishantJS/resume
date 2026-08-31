import { ProjectData } from "./projects.data";

/** A project page's meta, resolved once for both the client-side
    `useSeo` and the build-time prerender. */
export const projectSeo = (project: ProjectData) => ({
  title: `${project.displayTitle ?? project.title} — Nishant Chorge`,
  description: project.description,
  path: project.path,
  image: `/project/${project.title}/logo.webp`,
});
