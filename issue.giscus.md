# Dynamic Theme Switching Issue with VitePress Integration

## Problem Description

I'm experiencing issues with dynamic theme switching when using giscus with VitePress. When users toggle between light and dark themes on the website, the giscus comment system doesn't update its theme accordingly and remains stuck on the initial theme.

## Environment

- **VitePress**: Latest version
- **Integration**: Using `vitepress-plugin-comment-with-giscus`
- **Browser**: All modern browsers
- **Theme configuration**: Using `noborder_light.css` and `noborder_dark.css`

## Current Implementation

```javascript
import { useData, inBrowser } from 'vitepress';
import { watch } from 'vue';
import giscusTalk from 'vitepress-plugin-comment-with-giscus';

const { frontmatter, isDark } = useData();

// Watch for theme changes and attempt to update giscus
watch(isDark, (newVal) => {
  if (inBrowser) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) {
      iframe.contentWindow.postMessage({
        giscus: {
          setConfig: {
            theme: newVal ? 'noborder_dark' : 'noborder_light'
          }
        }
      }, 'https://giscus.app');
    }
  }
});

// Initialize giscus with dynamic theme
giscusTalk({
  repo: 'minorcell/cellstack',
  repoId: 'R_kgDOPdW_4w',
  category: 'General',
  categoryId: 'DIC_kwDOPdW_484CuOIM',
  mapping: 'pathname',
  inputPosition: 'bottom',
  lang: 'zh-CN',
  theme: isDark.value ? 'noborder_dark' : 'noborder_light'
}, {
  frontmatter, route
}, true);
```

## What I've Tried

1. **Direct theme URL switching**: Tried passing theme URLs directly based on `isDark.value`
2. **PostMessage API**: Attempted to use `postMessage` to communicate theme changes to the iframe
3. **Theme name switching**: Used theme names like `'dark'`, `'light'`, `'noborder_dark'`, `'noborder_light'`
4. **Transparent themes**: Tried using `'transparent_dark'` theme

## Expected Behavior

When a user clicks the theme toggle button in VitePress:
- The website theme switches correctly ✅
- The giscus comment system should automatically update to match the new theme ❌

## Actual Behavior

- The website theme switches correctly
- Giscus comments remain in the initial theme (doesn't update)
- No console errors are shown
- The iframe seems to ignore the postMessage calls

## Questions

1. Is the postMessage API the correct approach for dynamic theme switching?
2. Are there any specific timing considerations when sending theme updates?
3. Should I be listening for any specific events or iframe load states?
4. Is there a recommended pattern for VitePress + giscus integration?

## Additional Context

This seems to be a common issue based on similar reports in the community. A working solution would greatly benefit VitePress users who want to integrate giscus with proper theme synchronization.

## Possible Solutions to Consider

1. Expose a JavaScript API for theme switching
2. Provide better documentation for SPA integration patterns
3. Add support for automatic theme detection from parent window
4. Improve postMessage handling reliability

Thank you for maintaining this excellent commenting system!