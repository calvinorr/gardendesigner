/**
 * Diagnostic tests to isolate Google Maps script loading issues
 * These tests focus on the core script loading logic without UI components
 */

export {}; // Make this a module to satisfy TypeScript isolatedModules

describe('Google Maps Script Loading Diagnostics', () => {
  const mockApiKey = 'mykey'; /** security violation*/

  beforeEach(() => {
    // Clean up any existing scripts and globals
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => script.remove());
    delete (window as any).google;

    // Reset DOM head
    const head = document.head || document.getElementsByTagName('head')[0];
    head.innerHTML = '';
  });

  afterEach(() => {
    // Clean up after each test
    const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    scripts.forEach(script => script.remove());
    delete (window as any).google;
  });

  test('1. Script creation and URL formation', () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mockApiKey}&libraries=geometry,drawing&loading=async`;

    expect(script.src).toContain(mockApiKey);
    expect(script.src).toContain('libraries=geometry,drawing');
    expect(script.src).toContain('loading=async');
  });

  test('2. Minimal script URL without problematic libraries', () => {
    const minimalScript = document.createElement('script');
    minimalScript.src = `https://maps.googleapis.com/maps/api/js?key=${mockApiKey}`;

    expect(minimalScript.src).toContain(mockApiKey);
    expect(minimalScript.src).not.toContain('libraries=');
    expect(minimalScript.src).not.toContain('loading=async');
  });

  test('3. Script cleanup mechanism', () => {
    // Add multiple scripts to DOM
    const script1 = document.createElement('script');
    script1.src = 'https://maps.googleapis.com/maps/api/js?key=test1';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://maps.googleapis.com/maps/api/js?key=test2';
    document.head.appendChild(script2);

    expect(document.querySelectorAll('script[src*="maps.googleapis.com"]')).toHaveLength(2);

    // Test cleanup
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => script.remove());

    expect(document.querySelectorAll('script[src*="maps.googleapis.com"]')).toHaveLength(0);
  });

  test('4. Google Maps object structure validation', () => {
    // Mock the Google Maps API structure
    (window as any).google = {
      maps: {
        Map: function() {},
        Marker: function() {},
        MapTypeControlStyle: {
          HORIZONTAL_BAR: 0,
          DROPDOWN_MENU: 1,
          DEFAULT: 0
        },
        ControlPosition: {
          TOP_CENTER: 2,
          TOP_LEFT: 1,
          TOP_RIGHT: 3
        },
        SymbolPath: {
          CIRCLE: 0,
          FORWARD_CLOSED_ARROW: 1
        }
      }
    };

    // Test the problematic constants that cause bp/QM errors
    expect((window as any).google.maps.MapTypeControlStyle.HORIZONTAL_BAR).toBeDefined();
    expect((window as any).google.maps.ControlPosition.TOP_CENTER).toBeDefined();

    // Clean up
    delete (window as any).google;
  });

  test('5. Script loading promise simulation', async () => {
    const loadGoogleMapsScript = (): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        // Check if Google Maps is already loaded
        if ((window as any).google && (window as any).google.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${mockApiKey}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          // Mock successful loading
          (window as any).google = {
            maps: {
              MapTypeControlStyle: { HORIZONTAL_BAR: 0 },
              ControlPosition: { TOP_CENTER: 2 }
            }
          };
          resolve();
        };

        script.onerror = () => {
          reject(new Error('Failed to load Google Maps script'));
        };

        document.head.appendChild(script);

        // Simulate successful load after short delay
        setTimeout(() => {
          if (script.onload) {
            script.onload(new Event('load'));
          }
        }, 100);
      });
    };

    await expect(loadGoogleMapsScript()).resolves.toBeUndefined();
    expect((window as any).google.maps.MapTypeControlStyle.HORIZONTAL_BAR).toBe(0);
  });

  test('6. Race condition simulation', async () => {
    let loadAttempts = 0;

    const attemptLoad = async (): Promise<void> => {
      loadAttempts++;

      // Simulate cleanup
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => script.remove());

      // Simulate script creation
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mockApiKey}`;
      document.head.appendChild(script);

      return new Promise(resolve => setTimeout(resolve, 50));
    };

    // Simulate multiple rapid load attempts (like React StrictMode)
    await Promise.all([
      attemptLoad(),
      attemptLoad(),
      attemptLoad()
    ]);

    expect(loadAttempts).toBe(3);

    // Check how many scripts ended up in DOM
    const finalScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    console.log(`Race condition test: ${loadAttempts} attempts resulted in ${finalScripts.length} scripts`);

    expect(finalScripts.length).toBeLessThanOrEqual(3);
  });

  test('7. Constant validation without libraries', () => {
    // Mock Google Maps without geometry/drawing libraries
    (window as any).google = {
      maps: {
        Map: function() {},
        Marker: function() {},
        MapTypeControlStyle: {
          HORIZONTAL_BAR: 0
        },
        ControlPosition: {
          TOP_CENTER: 2
        },
        SymbolPath: {
          CIRCLE: 0
        }
      }
    };

    // These should be available even without geometry/drawing libraries
    expect((window as any).google.maps.MapTypeControlStyle).toBeDefined();
    expect((window as any).google.maps.MapTypeControlStyle.HORIZONTAL_BAR).toBe(0);
    expect((window as any).google.maps.ControlPosition.TOP_CENTER).toBe(2);
    expect((window as any).google.maps.SymbolPath.CIRCLE).toBe(0);
  });

  test('8. Error simulation - missing constants', () => {
    // Mock incomplete Google Maps object (simulates bp/QM errors)
    (window as any).google = {
      maps: {
        Map: function() {}
        // Missing MapTypeControlStyle and other constants
      }
    };

    // These should be undefined and cause errors
    expect((window as any).google.maps.MapTypeControlStyle).toBeUndefined();
    expect((window as any).google.maps.ControlPosition).toBeUndefined();

    // Test fallback values
    const horizontalBar = (window as any).google.maps.MapTypeControlStyle?.HORIZONTAL_BAR || 0;
    const topCenter = (window as any).google.maps.ControlPosition?.TOP_CENTER || 0;

    expect(horizontalBar).toBe(0);
    expect(topCenter).toBe(0);
  });
});
