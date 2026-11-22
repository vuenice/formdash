export interface FormdashIntegrationOptions {
  /** Route pattern for Formdash Visual Studio. Defaults to '/admin/formdash' */
  studioRoute?: string;
  /** Route pattern for Formdash Live Preview. Defaults to '/admin/formdash/preview' */
  previewRoute?: string;
}

export interface InjectedRoute {
  pattern: string;
  entrypoint: string;
  prerender?: boolean;
}

export interface AstroConfigSetupOptions {
  injectRoute: (route: InjectedRoute) => void;
  [key: string]: any;
}

export interface AstroIntegration {
  name: string;
  hooks: {
    'astro:config:setup'?: (options: AstroConfigSetupOptions) => void | Promise<void>;
    [key: string]: any;
  };
}

/**
 * Astro Integration that auto-injects Formdash Studio & Preview routes into any Astro/EmDash project.
 */
export function formdashIntegration(options: FormdashIntegrationOptions = {}): AstroIntegration {
  const studioRoute = options.studioRoute || '/admin/formdash';
  const previewRoute = options.previewRoute || '/admin/formdash/preview';

  return {
    name: '@formdash/core',
    hooks: {
      'astro:config:setup': ({ injectRoute }: AstroConfigSetupOptions) => {
        // 1. Auto-inject Formdash Studio
        injectRoute({
          pattern: studioRoute,
          entrypoint: '@formdash/core/pages/formdash.astro',
          prerender: false,
        });

        // 2. Auto-inject Formdash Live Preview
        injectRoute({
          pattern: previewRoute,
          entrypoint: '@formdash/core/pages/formdash/preview.astro',
          prerender: false,
        });
      },
    },
  };
}

export const formdashAstro = formdashIntegration;
export const formdash = formdashIntegration;
