import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

const browsers = process.env.CI
  ? [playwrightLauncher({ product: 'chromium' })] 
  : [playwrightLauncher({ product: 'chromium' }), playwrightLauncher({ product: 'firefox' }), playwrightLauncher({ product: 'webkit' })]; 

export default {
  files: ['src/**/*.test.js'],
  nodeResolve: {
    exportConditions: ['development'], 
    process: true, 
  },        
  plugins: [
    esbuildPlugin({
      ts: false,
      target: 'es2020',
      define: { 'process.env.NODE_ENV': '\"test\"' },
    })
  ], 
  browsers: browsers,
  testFramework: {
    config: {
      ui: 'bdd', 
      timeout: '5000', 
    },
  },
  coverageConfig: { 
    report: true,
    reportDir: 'coverage',
    reporters: ['text', 'lcov'], 
    threshold: { 
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
    include: [ 
      'src/components/**/*.js', 
      'src/shared-styles/**/*.js', 
      'src/services/**/*.js', 
      'src/store/**/*.js', 
      'src/main.js',
    ],
    exclude: [
      '**/*.test.js',
      '**/node_modules/**',
      '**/web_modules/**',
    ],
  },
  testRunnerHtml: testFramework =>
    `<html>\
      <body>\
        <script>\
          // Simple shim for process.env.NODE_ENV
          window.process = { env: { NODE_ENV: 'test' } };
        </script>\
        <script type="module" src="${testFramework}"></script>\
      </body>\
    </html>`,
}; 