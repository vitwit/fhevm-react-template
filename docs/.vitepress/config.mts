import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "FHEVM-SDK",
  description: "FHEVM-SDK",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "", link: "/" },
      {
        text: "Packages",
        items: [
          {
            text: "Overview",
            link: "/packages/",
          },
          {
            text: "Core",
            link: "/packages/core/",
          },
          {
            text: "React",
            link: "/packages/react/",
          },
          {
            text: "Vue",
            link: "/packages/vue/",
          },
        ],
      },
      {
        text: "Examples",
        items: [
          {
            text: "Node",
            link: "/examples#node-js-demo",
          },
          {
            text: "Next.js",
            link: "examples#next-js-demo",
          },
          {
            text: "Vue",
            link: "/examples#vue-js-demo",
          },
        ],
      },
      {
        text: "Resources",
        items: [
          { text: "FHEVM Docs", link: "https://docs.zama.ai" },
          {
            text: "GitHub",
            link: "https://github.com/vitwit/fhevm-react-template",
          },
        ],
      },
    ],

    sidebar: [
      { text: "Getting Started", link: "/" },
      {
        text: "Packages",
        link: "/packages/",
        collapsed: false,
        items: [
          {
            text: "Core",
            link: "/packages/core",
          },
          {
            text: "React",
            link: "/packages/react",
          },
          {
            text: "Vue",
            link: "/packages/vue",
          },
        ],
      },
      {
        text: "Examples",
        // link: "/examples/",
        collapsed: false,
        items: [
          {
            text: "Node",
            link: "/examples#node-js-demo",
          },
          {
            text: "Next.js",
            link: "/examples#next-js-demo",
          },
          {
            text: "Vue",
            link: "/examples#vue-js-demo",
          },
        ],
      },
    ],

    // Show table of contents in right sidebar
    outline: {
      level: [2, 3], // Show h2 and h3 headings
      label: "On this page",
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/vitwit/fhevm-react-template",
      },
    ],

    search: {
      provider: "local",
    },

    docFooter: {
      prev: "Previous",
      next: "Next",
    },
  },
  ignoreDeadLinks: true,
});
